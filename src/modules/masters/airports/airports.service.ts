import { Injectable } from "@nestjs/common";
import { Airport } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class AirportsService extends BaseMasterService<Airport> {
  protected readonly modelName = "airport";
  protected readonly searchFields = ["name", "iata_code", "city"];
  protected readonly uniqueKeyLabel = "IATA code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
