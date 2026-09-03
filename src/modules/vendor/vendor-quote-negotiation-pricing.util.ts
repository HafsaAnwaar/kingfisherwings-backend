import { Prisma } from "@prisma/client";

export type VendorLineSnapshot = {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
};

export function buildVendorLineSnapshots(
  lines: Array<{
    description: string;
    quantity: unknown;
    unit_price: unknown;
    amount: unknown;
  }>,
): VendorLineSnapshot[] {
  return lines.map((line) => ({
    description: line.description,
    quantity: Number(line.quantity),
    unit_price: Number(line.unit_price),
    amount: Number(line.amount),
  }));
}

export async function applyTotalToVendorCostLines(
  tx: Prisma.TransactionClient,
  tenantId: string,
  quoteId: string,
  total: number,
): Promise<VendorLineSnapshot[]> {
  const lines = await tx.vendorQuoteLine.findMany({
    where: { tenant_id: tenantId, vendor_quote_id: quoteId },
    orderBy: { sort_order: "asc" },
  });

  if (!lines.length) {
    await tx.vendorQuoteLine.create({
      data: {
        tenant_id: tenantId,
        vendor_quote_id: quoteId,
        description: "Negotiated cost",
        quantity: 1,
        unit_price: total,
        amount: total,
        sort_order: 0,
      },
    });
  } else if (lines.length === 1) {
    await tx.vendorQuoteLine.update({
      where: { id: lines[0].id },
      data: { quantity: 1, unit_price: total, amount: total },
    });
  } else {
    const currentSum = lines.reduce((sum, line) => sum + Number(line.amount), 0);
    for (const line of lines) {
      const share =
        currentSum > 0
          ? (Number(line.amount) / currentSum) * total
          : total / lines.length;
      const rounded = Math.round(share * 10000) / 10000;
      const qty = Number(line.quantity) || 1;
      await tx.vendorQuoteLine.update({
        where: { id: line.id },
        data: {
          amount: rounded,
          unit_price: rounded / qty,
        },
      });
    }
  }

  const updated = await tx.vendorQuoteLine.findMany({
    where: { tenant_id: tenantId, vendor_quote_id: quoteId },
    orderBy: { sort_order: "asc" },
  });
  return buildVendorLineSnapshots(updated);
}

export function buildVendorNegotiationPricingView(quote: {
  cost_total: unknown;
  vendor_proposed_total: unknown;
  vendor_proposed_lines: unknown;
  vendor_proposed_at: Date | null;
  negotiation_round: number;
  lines?: Array<{
    description: string;
    quantity: unknown;
    unit_price: unknown;
    amount: unknown;
  }>;
}) {
  const tenantLines = (quote.lines ?? []).map((line) => ({
    description: line.description,
    quantity: line.quantity,
    unit_price: line.unit_price,
    amount: line.amount,
  }));

  const tenantOfferedTotal = tenantLines.length
    ? tenantLines.reduce((sum, line) => sum + Number(line.amount), 0)
    : Number(quote.cost_total);

  return {
    round: quote.negotiation_round,
    /** Live total on the offer (same role as quotation revenue_total). */
    cost_total: Number(quote.cost_total),
    tenant_offered_total: tenantOfferedTotal,
    tenant_offered_lines: tenantLines,
    vendor_proposed_total: quote.vendor_proposed_total,
    vendor_proposed_lines: quote.vendor_proposed_lines,
    vendor_proposed_at: quote.vendor_proposed_at,
  };
}

export function normalizeVendorLines(
  lines: Array<{
    description: string;
    quantity?: number;
    unit_price: number;
    amount?: number;
  }>,
  fallbackTotal?: number,
): Array<{
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  sort_order: number;
}> {
  if (lines?.length) {
    return lines.map((line, index) => {
      const quantity = line.quantity ?? 1;
      const amount = line.amount ?? quantity * line.unit_price;
      return {
        description: line.description,
        quantity,
        unit_price: line.unit_price,
        amount,
        sort_order: index,
      };
    });
  }
  if (fallbackTotal != null) {
    return [
      {
        description: "Cost offer",
        quantity: 1,
        unit_price: fallbackTotal,
        amount: fallbackTotal,
        sort_order: 0,
      },
    ];
  }
  return [];
}
