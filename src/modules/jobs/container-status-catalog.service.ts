import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ContainerStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { normalizeStatusCode } from "./utils/status-catalog.util";
import {
  CreateStatusCatalogDto,
  UpdateStatusCatalogDto,
} from "./dto/status-catalog.dto";

const SYSTEM_CONTAINER_STATUSES: Array<{
  code: ContainerStatus;
  label: string;
  sort_order: number;
}> = [
  { code: "EMPTY", label: "Empty", sort_order: 10 },
  { code: "PICKED", label: "Picked", sort_order: 20 },
  { code: "STUFFED", label: "Stuffed", sort_order: 30 },
  { code: "GATED_IN", label: "Gated in", sort_order: 40 },
  { code: "LOADED", label: "Loaded", sort_order: 50 },
  { code: "IN_TRANSIT", label: "In transit", sort_order: 60 },
  { code: "DISCHARGED", label: "Discharged", sort_order: 70 },
  { code: "RETURNED", label: "Returned", sort_order: 80 },
];

const SYSTEM_CODES = new Set<string>(
  SYSTEM_CONTAINER_STATUSES.map((row) => row.code),
);

export function containerEnumForCode(code: string): ContainerStatus | null {
  return SYSTEM_CODES.has(code) ? (code as ContainerStatus) : null;
}

@Injectable()
export class ContainerStatusCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureCatalog(tenantId: string) {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const count = await tx.containerStatusCatalog.count({
        where: { tenant_id: tenantId },
      });
      if (count > 0) return;
      await tx.containerStatusCatalog.createMany({
        data: SYSTEM_CONTAINER_STATUSES.map((row) => ({
          tenant_id: tenantId,
          code: row.code,
          label: row.label,
          sort_order: row.sort_order,
          maps_to_system_status: row.code,
          is_system: true,
          is_custom: false,
          is_active: true,
        })),
      });
    });
  }

  async listOptions(tenantId: string) {
    await this.ensureCatalog(tenantId);
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.containerStatusCatalog.findMany({
        where: { tenant_id: tenantId, is_active: true },
        orderBy: { sort_order: "asc" },
      }),
    );
    return { success: true, data: rows };
  }

  async optionCodes(tenantId: string): Promise<string[]> {
    const listed = await this.listOptions(tenantId);
    return listed.data.map((row) => row.code);
  }

  async createCustom(tenantId: string, dto: CreateStatusCatalogDto) {
    await this.ensureCatalog(tenantId);
    const label = dto.label.trim();
    if (!label) throw new BadRequestException("Label is required.");
    const code = normalizeStatusCode(dto.code, label);
    const mapsTo = SYSTEM_CODES.has(dto.maps_to_system_status ?? "")
      ? dto.maps_to_system_status!
      : "EMPTY";
    try {
      const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
        let candidate = code;
        let n = 2;
        while (
          await tx.containerStatusCatalog.findFirst({
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
        return tx.containerStatusCatalog.create({
          data: {
            tenant_id: tenantId,
            code: candidate,
            label,
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
    await this.ensureCatalog(tenantId);
    const existing = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.containerStatusCatalog.findFirst({
        where: { id, tenant_id: tenantId },
      }),
    );
    if (!existing) {
      throw new NotFoundException("Container status not found.");
    }
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.containerStatusCatalog.update({
        where: { id },
        data: {
          ...(dto.label !== undefined ? { label: dto.label.trim() } : {}),
          ...(dto.sort_order !== undefined ? { sort_order: dto.sort_order } : {}),
          ...(dto.is_active !== undefined ? { is_active: dto.is_active } : {}),
        },
      }),
    );
    return { success: true, data: updated };
  }

  async deactivate(tenantId: string, id: string) {
    const existing = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.containerStatusCatalog.findFirst({
        where: { id, tenant_id: tenantId },
      }),
    );
    if (!existing) throw new NotFoundException("Container status not found.");
    if (existing.is_system) {
      throw new BadRequestException("System container statuses cannot be removed.");
    }
    return this.updateCustom(tenantId, id, { is_active: false });
  }

  async resolve(tenantId: string, raw: string) {
    await this.ensureCatalog(tenantId);
    const code = raw.trim().toUpperCase().replace(/\s+/g, "_");
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.containerStatusCatalog.findFirst({
        where: { tenant_id: tenantId, code, is_active: true },
      }),
    );
    if (!row) {
      throw new BadRequestException(
        `Container status "${raw}" is not in the catalog. Add it under container statuses first.`,
      );
    }
    return {
      code: row.code,
      label: row.label,
      enumStatus: containerEnumForCode(row.maps_to_system_status) ??
        containerEnumForCode(row.code),
    };
  }
}
