import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DocumentationAirTrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async getByMawb(tenantId: string, mawbNumber: string) {
    const normalized = mawbNumber.trim().toUpperCase();

    const cached = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationAirTrackingEvent.findFirst({
        where: { tenant_id: tenantId, mawb_number: normalized },
      }),
    );

    if (cached) {
      return {
        mawb_number: normalized,
        source: "cache",
        fetched_at: cached.fetched_at,
        events: cached.events,
      };
    }

    const stubEvents = [
      {
        code: "BKD",
        description: "Booked",
        location: "ORIGIN",
        event_time: new Date().toISOString(),
      },
      {
        code: "DEP",
        description: "Departed (stub)",
        location: "HUB",
        event_time: new Date().toISOString(),
      },
    ];

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationAirTrackingEvent.upsert({
        where: {
          tenant_id_mawb_number: {
            tenant_id: tenantId,
            mawb_number: normalized,
          },
        },
        create: {
          tenant_id: tenantId,
          mawb_number: normalized,
          events: stubEvents,
        },
        update: {
          events: stubEvents,
          fetched_at: new Date(),
        },
      }),
    );

    return {
      mawb_number: normalized,
      source: "stub",
      fetched_at: new Date().toISOString(),
      events: stubEvents,
    };
  }
}
