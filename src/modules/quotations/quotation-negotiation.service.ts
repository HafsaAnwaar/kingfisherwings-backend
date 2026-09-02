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
    const events = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotationNegotiationEvent.findMany({
        where: { tenant_id: tenantId, quotation_id: quotationId },
        orderBy: { created_at: "asc" },
      }),
    );
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
      !["SENT", "NEGOTIATING", "CUSTOMER_REVIEW", "APPROVED"].includes(status)
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
