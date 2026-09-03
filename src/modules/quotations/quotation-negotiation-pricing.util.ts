import { Prisma } from "@prisma/client";

export type NegotiationLineSnapshot = {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
};

export function buildLineSnapshots(
  lines: Array<{
    description: string;
    quantity: unknown;
    unit_price: unknown;
    amount: unknown;
  }>,
): NegotiationLineSnapshot[] {
  return lines.map((line) => ({
    description: line.description,
    quantity: Number(line.quantity),
    unit_price: Number(line.unit_price),
    amount: Number(line.amount),
  }));
}

export async function applyTotalToRevenueLines(
  tx: Prisma.TransactionClient,
  tenantId: string,
  quotationId: string,
  total: number,
  actorId?: string,
): Promise<NegotiationLineSnapshot[]> {
  const revenueLines = await tx.quotationLine.findMany({
    where: {
      tenant_id: tenantId,
      quotation_id: quotationId,
      is_cost: false,
    },
    orderBy: { sort_order: "asc" },
  });

  if (!revenueLines.length) {
    throw new Error("No revenue lines exist to apply negotiated total.");
  }

  const currentSum = revenueLines.reduce(
    (sum, line) => sum + Number(line.amount),
    0,
  );

  if (revenueLines.length === 1) {
    const line = revenueLines[0];
    await tx.quotationLine.update({
      where: { id: line.id },
      data: {
        quantity: 1,
        unit_price: total,
        amount: total,
        amount_base_currency: total * Number(line.exchange_rate),
        updated_by: actorId,
      },
    });
  } else {
    for (const line of revenueLines) {
      const share =
        currentSum > 0
          ? (Number(line.amount) / currentSum) * total
          : total / revenueLines.length;
      const rounded = Math.round(share * 10000) / 10000;
      const qty = Number(line.quantity) || 1;
      await tx.quotationLine.update({
        where: { id: line.id },
        data: {
          amount: rounded,
          unit_price: rounded / qty,
          amount_base_currency: rounded * Number(line.exchange_rate),
          updated_by: actorId,
        },
      });
    }
  }

  const updated = await tx.quotationLine.findMany({
    where: {
      tenant_id: tenantId,
      quotation_id: quotationId,
      is_cost: false,
    },
    orderBy: { sort_order: "asc" },
  });

  return buildLineSnapshots(updated);
}

export function buildNegotiationPricingView(quotation: {
  revenue_total: unknown;
  customer_proposed_total: unknown;
  customer_proposed_lines: unknown;
  customer_proposed_at: Date | null;
  negotiation_round: number;
  lines?: Array<{
    description: string;
    quantity: unknown;
    unit_price: unknown;
    amount: unknown;
    is_cost: boolean;
  }>;
}) {
  const tenantLines = (quotation.lines ?? [])
    .filter((line) => !line.is_cost)
    .map((line) => ({
      description: line.description,
      quantity: line.quantity,
      unit_price: line.unit_price,
      amount: line.amount,
    }));

  const tenantOfferedTotal = tenantLines.length
    ? tenantLines.reduce((sum, line) => sum + Number(line.amount), 0)
    : Number(quotation.revenue_total);

  return {
    round: quotation.negotiation_round,
    tenant_offered_total: tenantOfferedTotal,
    tenant_offered_lines: tenantLines,
    customer_proposed_total: quotation.customer_proposed_total,
    customer_proposed_lines: quotation.customer_proposed_lines,
    customer_proposed_at: quotation.customer_proposed_at,
  };
}
