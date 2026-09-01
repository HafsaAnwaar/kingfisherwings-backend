import { Injectable } from "@nestjs/common";
import { Holiday } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class HolidaysService extends BaseMasterService<Holiday> {
  protected readonly modelName = "holiday";
  protected readonly searchFields = ["name", "country_code"];
  protected readonly uniqueKeyLabel = "holiday date for this country";
  protected readonly supportsIsActive = false;

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(
    tenantId: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<Holiday> {
    return super.create(tenantId, this.coerceDates(data), actorId);
  }

  async update(
    tenantId: string,
    id: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<Holiday> {
    return super.update(tenantId, id, this.coerceDates(data), actorId);
  }

  private coerceDates(data: Record<string, unknown>): Record<string, unknown> {
    const next = { ...data };
    if (typeof next.date === "string") {
      next.date = new Date(next.date);
    }
    return next;
  }
}
