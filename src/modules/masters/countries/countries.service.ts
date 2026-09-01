import { Injectable } from "@nestjs/common";
import { Country } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class CountriesService extends BaseMasterService<Country> {
  protected readonly modelName = "country";
  protected readonly searchFields = ["name", "iso_code", "iso3_code"];
  protected readonly uniqueKeyLabel = "ISO code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
