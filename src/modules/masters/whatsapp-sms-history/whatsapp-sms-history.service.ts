import { Injectable } from "@nestjs/common";
import { OutboundMessageChannel, Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { CreateOutboundMessageLogDto } from "../dto/outbound-message-log.dto";

export type MessageHistoryQuery = {
  page?: number;
  limit?: number;
  channel?: OutboundMessageChannel;
  q?: string;
};

@Injectable()
export class WhatsappSmsHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, query: MessageHistoryQuery) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.OutboundMessageLogWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
      };
      if (query.channel) where.channel = query.channel;
      if (query.q?.trim()) {
        const q = query.q.trim();
        where.OR = [
          { to_address: { contains: q, mode: "insensitive" } },
          { body_snippet: { contains: q, mode: "insensitive" } },
          { status: { contains: q, mode: "insensitive" } },
        ];
      }

      const [data, total] = await Promise.all([
        tx.outboundMessageLog.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { sent_at: "desc" },
        }),
        tx.outboundMessageLog.count({ where }),
      ]);

      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 0,
        },
      };
    });
  }

  async append(
    tenantId: string,
    actorId: string,
    dto: CreateOutboundMessageLogDto,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      return tx.outboundMessageLog.create({
        data: {
          tenant_id: tenantId,
          channel: dto.channel,
          to_address: dto.to_address,
          body_snippet: dto.body_snippet,
          status: dto.status ?? "SENT",
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });
  }
}
