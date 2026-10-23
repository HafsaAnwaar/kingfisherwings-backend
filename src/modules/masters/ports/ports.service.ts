import { Injectable } from "@nestjs/common";
import { Port, Prisma, ShipmentMode } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";
import { CreatePortDto } from "../dto/port.dto";
import { MasterQueryDto } from "../dto/master-query.dto";
import { WorldPortsSeedService } from "../world-ports-seed.service";

@Injectable()
export class PortsService extends BaseMasterService<Port> {
  protected readonly modelName = "port";
  protected readonly searchFields = ["name", "un_locode", "city"];
  protected readonly uniqueKeyLabel = "UN/LOCODE";
  protected readonly orderByField = "name";

  constructor(
    prisma: PrismaService,
    private readonly worldPorts: WorldPortsSeedService,
  ) {
    super(prisma);
  }

  async findAll(tenantId: string, query: MasterQueryDto) {
    // Background seed only — never block or fail the list on catalog insert.
    await this.worldPorts.ensureSeaPorts(tenantId).catch(() => undefined);
    return super.findAll(tenantId, query);
  }

  /**
   * Inline create from quote/job payloads: reuse existing UN/LOCODE when present.
   */
  async findOrCreateInline(
    tenantId: string,
    dto: CreatePortDto,
    actorId?: string,
  ): Promise<Port> {
    const unLocode = dto.un_locode.trim().toUpperCase();
    const existing = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.port.findFirst({
        where: {
          tenant_id: tenantId,
          un_locode: unLocode,
          deleted_at: null,
        },
      }),
    );
    if (existing) return existing;

    try {
      return await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.port.create({
          data: {
            tenant_id: tenantId,
            un_locode: unLocode,
            name: dto.name.trim(),
            city: dto.city?.trim() || null,
            country_code: dto.country_code.trim().toUpperCase(),
            mode: dto.mode ?? ShipmentMode.SEA,
            latitude: dto.latitude,
            longitude: dto.longitude,
            is_active: dto.is_active ?? true,
            created_by: actorId,
          },
        }),
      );
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        const again = await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.port.findFirst({
            where: {
              tenant_id: tenantId,
              un_locode: unLocode,
              deleted_at: null,
            },
          }),
        );
        if (again) return again;
      }
      throw err;
    }
  }
}
