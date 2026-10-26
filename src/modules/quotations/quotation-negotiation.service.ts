import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Prisma,
  QuotationNegotiationAction,
  QuotationNegotiationActor,
  QuotationStatus,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export interface NegotiationEventInput {
  quotationId: string;
  round: number;
  actor: QuotationNegotiationActor;
  action: QuotationNegotiationAction;
  message?: string;
  proposedTotal?: number;
  proposedLines?: unknown;
  createdBy?: string;
}

@Injectable()
export class QuotationNegotiationService {
  constructor(private readonly prisma: PrismaService) {}

  async getTimeline(tenantId: string, quotationId: string) {
    const events = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const rows = await tx.quotationNegotiationEvent.findMany({
        where: { tenant_id: tenantId, quotation_id: quotationId },
        orderBy: { created_at: "asc" },
      });
      const actorIds = [
        ...new Set(rows.map((r) => r.created_by).filter(Boolean) as string[]),
      ];
      const users =
        actorIds.length === 0
          ? []
          : await tx.user.findMany({
              where: { id: { in: actorIds }, tenant_id: tenantId },
              select: { id: true, first_name: true, last_name: true, email: true },
            });
      const byId = new Map(
        users.map((u) => [
          u.id,
          {
            id: u.id,
            name:
              [u.first_name, u.last_name].filter(Boolean).join(" ").trim() ||
              u.email,
          },
        ]),
      );
      return rows.map((r) => ({
        ...r,
        actor_user: r.created_by ? (byId.get(r.created_by) ?? null) : null,
        performed_by_name: r.created_by
          ? (byId.get(r.created_by)?.name ?? null)
          : null,
      }));
    });
    return { success: true, data: events };
  }

  async appendEvent(
    tx: Prisma.TransactionClient,
    tenantId: string,
    input: NegotiationEventInput,
  ) {
    return tx.quotationNegotiationEvent.create({
      data: {
        tenant_id: tenantId,
        quotation_id: input.quotationId,
        round: input.round,
        actor: input.actor,
        action: input.action,
        message: input.message,
        proposed_total: input.proposedTotal,
        proposed_lines: input.proposedLines as Prisma.InputJsonValue,
        created_by: input.createdBy,
      },
    });
  }

  assertCustomerActionable(status: QuotationStatus) {
    if (!["SENT", "CUSTOMER_REVIEW", "NEGOTIATING"].includes(status)) {
      throw new BadRequestException(
        `Quotation in ${status} status cannot be acted on by customer.`,
      );
    }
  }

  assertTenantNegotiable(status: QuotationStatus) {
    if (
      !["SENT", "NEGOTIATING", "CUSTOMER_REVIEW"].includes(status)
    ) {
      throw new BadRequestException(
        `Quotation in ${status} status cannot be revised.`,
      );
    }
  }

  async getQuotationOrThrow(
    tx: Prisma.TransactionClient,
    tenantId: string,
    quotationId: string,
  ) {
    const quotation = await tx.quotation.findFirst({
      where: { id: quotationId, tenant_id: tenantId, deleted_at: null },
    });
    if (!quotation) throw new NotFoundException("Quotation not found.");
    return quotation;
  }
}
