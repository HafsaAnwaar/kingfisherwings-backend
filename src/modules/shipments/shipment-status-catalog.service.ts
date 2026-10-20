import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, ShipmentStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  DEFAULT_SHIPMENT_STATUS_CATALOG,
  SYSTEM_SHIPMENT_STATUSES,
} from "../jobs/constants/job-status-catalog.defaults";
import {
  CreateStatusCatalogDto,
  UpdateStatusCatalogDto,
} from "../jobs/dto/status-catalog.dto";
import { normalizeStatusCode } from "../jobs/utils/status-catalog.util";

const DEFAULT_CUSTOM_MAPS_TO = "IN_PROGRESS";

@Injectable()
export class ShipmentStatusCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureCatalog(tenantId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const count = await tx.shipmentStatusCatalog.count({
        where: { tenant_id: tenantId },
      });
      if (count > 0) return;
      await tx.shipmentStatusCatalog.createMany({
        data: DEFAULT_SHIPMENT_STATUS_CATALOG.map((row) => ({
          tenant_id: tenantId,
          ...row,
        })),
      });
    });
  }

  async listOptions(tenantId: string, shipmentId?: string) {
    await this.ensureCatalog(tenantId);
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipmentStatusCatalog.findMany({
        where: { tenant_id: tenantId, is_active: true },
        orderBy: { sort_order: "asc" },
      }),
    );

    let current: ShipmentStatus | null = null;
    let currentCode: string | null = null;
    if (shipmentId) {
      const row = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.shipment.findFirst({
          where: { id: shipmentId, tenant_id: tenantId, deleted_at: null },
          select: { status: true, status_code: true },
        }),
      );
      current = row?.status ?? null;
      currentCode = row?.status_code ?? row?.status ?? null;
    }

    const currentMeta = currentCode
      ? rows.find((r) => r.code === currentCode) ?? null
      : null;

    return {
      success: true,
      data: {
        options: rows.map((r) => ({
          code: r.code,
          label: r.label,
          is_terminal: r.is_terminal,
          maps_to_system_status: r.maps_to_system_status,
          is_system: r.is_system,
          is_custom: r.is_custom,
        })),
        current: current
          ? {
              code: currentCode ?? current,
              system_status: current,
              label: currentMeta?.label ?? currentCode ?? current,
            }
          : null,
        actions: {
          change_status: "POST /shipments/:id/change-status",
          create_custom: "POST /shipments/status-catalog",
        },
      },
    };
  }

  async createCustom(tenantId: string, dto: CreateStatusCatalogDto) {
    await this.ensureCatalog(tenantId);
    const label = dto.label.trim();
    if (!label) throw new BadRequestException("label is required.");

    const mapsTo = (dto.maps_to_system_status ?? DEFAULT_CUSTOM_MAPS_TO)
      .trim()
      .toUpperCase();
    if (!SYSTEM_SHIPMENT_STATUSES.includes(mapsTo as never)) {
      throw new BadRequestException(
        `maps_to_system_status must be one of: ${SYSTEM_SHIPMENT_STATUSES.join(", ")}`,
      );
    }

    let code = normalizeStatusCode(dto.code, label);
    if (SYSTEM_SHIPMENT_STATUSES.includes(code as never)) {
      code = normalizeStatusCode(undefined, `${label}_CUSTOM`);
    }

    try {
      const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
        let candidate = code;
        let n = 2;
        while (
          await tx.shipmentStatusCatalog.findFirst({
            where: { tenant_id: tenantId, code: candidate },
            select: { id: true },
          })
        ) {
          const suffix = `_${n}`;
          candidate = `${code.slice(0, 40 - suffix.length)}${suffix}`;
          n += 1;
          if (n > 50) {
            throw new ConflictException(
              `Could not allocate a unique code for "${label}".`,
            );
          }
        }
        return tx.shipmentStatusCatalog.create({
          data: {
            tenant_id: tenantId,
            code: candidate,
            label,
            is_terminal: dto.is_terminal ?? false,
            sort_order: dto.sort_order ?? 200,
            maps_to_system_status: mapsTo,
            is_system: false,
            is_custom: true,
            is_active: true,
          },
        });
      });
      return { success: true, data: row };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictException(`Status code ${code} already exists.`);
      }
      throw err;
    }
  }

  async updateCustom(
    tenantId: string,
    id: string,
    dto: UpdateStatusCatalogDto,
  ) {
    const existing = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipmentStatusCatalog.findFirst({
        where: { id, tenant_id: tenantId },
      }),
    );
    if (!existing) throw new NotFoundException("Status catalog row not found.");
    if (
      dto.maps_to_system_status &&
      existing.is_system &&
      dto.maps_to_system_status !== existing.maps_to_system_status
    ) {
      throw new BadRequestException("Cannot change maps_to on a system status.");
    }
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipmentStatusCatalog.update({
        where: { id },
        data: {
          ...(dto.label !== undefined ? { label: dto.label.trim() } : {}),
          ...(dto.maps_to_system_status !== undefined && !existing.is_system
            ? { maps_to_system_status: dto.maps_to_system_status }
            : {}),
          ...(dto.is_terminal !== undefined
            ? { is_terminal: dto.is_terminal }
            : {}),
          ...(dto.sort_order !== undefined ? { sort_order: dto.sort_order } : {}),
          ...(dto.is_active !== undefined ? { is_active: dto.is_active } : {}),
        },
      }),
    );
    return { success: true, data: updated };
  }

  async deactivate(tenantId: string, id: string) {
    return this.updateCustom(tenantId, id, { is_active: false });
  }

  async resolveCode(tenantId: string, code: string) {
    await this.ensureCatalog(tenantId);
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipmentStatusCatalog.findFirst({
        where: { tenant_id: tenantId, code, is_active: true },
      }),
    );
    if (!row) {
      throw new BadRequestException(
        `Status ${code} is not in the tenant shipment status catalog.`,
      );
    }
    return {
      code: row.code,
      systemStatus: row.maps_to_system_status as ShipmentStatus,
    };
  }
}
