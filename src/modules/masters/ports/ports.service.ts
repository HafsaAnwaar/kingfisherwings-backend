import { Injectable } from "@nestjs/common";
import { Port } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";
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
    await this.worldPorts.ensureSeaPorts(tenantId);
    return super.findAll(tenantId, query);
  }
}
