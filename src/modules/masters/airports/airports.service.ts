import { Injectable } from "@nestjs/common";
import { Airport } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";
import { MasterQueryDto } from "../dto/master-query.dto";
import { WorldPortsSeedService } from "../world-ports-seed.service";

@Injectable()
export class AirportsService extends BaseMasterService<Airport> {
  protected readonly modelName = "airport";
  protected readonly searchFields = ["name", "iata_code", "city", "icao_code"];
  protected readonly uniqueKeyLabel = "IATA code";
  protected readonly orderByField = "name";

  constructor(
    prisma: PrismaService,
    private readonly worldPorts: WorldPortsSeedService,
  ) {
    super(prisma);
  }

  async findAll(tenantId: string, query: MasterQueryDto) {
    await this.worldPorts.ensureAirports(tenantId);
    return super.findAll(tenantId, query);
  }
}
