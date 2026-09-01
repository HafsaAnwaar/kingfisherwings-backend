import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  DocumentationPaginationDto,
  paginated,
} from "./dto/documentation-pagination.dto";

export class CgmVoyageDto {
  vessel_id?: string;
  voyage_number!: string;
  origin_port_id?: string;
  dest_port_id?: string;
  etd?: string;
  eta?: string;
}

@Injectable()
export class DocumentationCgmService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: DocumentationPaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const [items, total] = await Promise.all([
        tx.documentationCgmVesselVoyage.findMany({
          where: { tenant_id: tenantId, deleted_at: null },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { etd: "desc" },
        }),
        tx.documentationCgmVesselVoyage.count({
          where: { tenant_id: tenantId, deleted_at: null },
        }),
      ]);
      return paginated(items, page, limit, total);
    });
  }

  async create(tenantId: string, dto: CgmVoyageDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationCgmVesselVoyage.create({
        data: {
          tenant_id: tenantId,
          vessel_id: dto.vessel_id,
          voyage_number: dto.voyage_number,
          origin_port_id: dto.origin_port_id,
          dest_port_id: dto.dest_port_id,
          etd: dto.etd ? new Date(dto.etd) : undefined,
          eta: dto.eta ? new Date(dto.eta) : undefined,
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  async update(
    tenantId: string,
    id: string,
    dto: Partial<CgmVoyageDto>,
    actorId?: string,
  ) {
    await this.findOne(tenantId, id);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationCgmVesselVoyage.update({
        where: { id },
        data: {
          ...(dto.vessel_id !== undefined ? { vessel_id: dto.vessel_id } : {}),
          ...(dto.voyage_number !== undefined
            ? { voyage_number: dto.voyage_number }
            : {}),
          ...(dto.origin_port_id !== undefined
            ? { origin_port_id: dto.origin_port_id }
            : {}),
          ...(dto.dest_port_id !== undefined
            ? { dest_port_id: dto.dest_port_id }
            : {}),
          ...(dto.etd !== undefined
            ? { etd: dto.etd ? new Date(dto.etd) : null }
            : {}),
          ...(dto.eta !== undefined
            ? { eta: dto.eta ? new Date(dto.eta) : null }
            : {}),
          updated_by: actorId,
        },
      }),
    );
  }

  async remove(tenantId: string, id: string, actorId?: string) {
    await this.findOne(tenantId, id);
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationCgmVesselVoyage.update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: actorId },
      }),
    );
  }

  async downloadEdi(tenantId: string, id: string, actorId?: string) {
    const voyage = await this.findOne(tenantId, id);
    const payload = `<?xml version="1.0"?><CgmVoyage id="${voyage.id}" number="${voyage.voyage_number}"/>`;
    return {
      content_type: "application/xml",
      data: payload,
      voyage_id: voyage.id,
    };
  }

  private async findOne(tenantId: string, id: string) {
    const voyage = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationCgmVesselVoyage.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!voyage) throw new NotFoundException("CGM voyage not found.");
    return voyage;
  }
}
