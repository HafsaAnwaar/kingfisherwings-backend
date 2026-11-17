import { CostingVisibilityAudience } from "../dto/job-costing.dto";

export type StaffCostingFlags = {
  can_see_sales: boolean;
  can_see_cost: boolean;
};

/** Map staff User flags → costing audience (or null = no access). */
export function audienceFromStaffFlags(
  flags: StaffCostingFlags | null | undefined,
  opts?: { seesAll?: boolean },
): CostingVisibilityAudience | null {
  if (opts?.seesAll) return "STAFF";
  if (!flags) return null;
  const sale = !!flags.can_see_sales;
  const cost = !!flags.can_see_cost;
  if (!sale && !cost) return null;
  if (sale && cost) return "STAFF";
  if (sale) return "CUSTOMER";
  return "VENDOR";
}

/** Strip sale or cost side for portal/vendor / partial-staff audiences. */
export function applyCostingVisibility<T extends Record<string, unknown>>(
  line: T,
  audience: CostingVisibilityAudience,
): T {
  if (audience === "STAFF") return line;
  const copy = { ...line } as T & {
    sale?: unknown;
    cost?: unknown;
    sale_voucher_no?: unknown;
    cost_voucher_no?: unknown;
  };
  if (audience === "CUSTOMER") {
    delete copy.cost;
    delete copy.cost_voucher_no;
  }
  if (audience === "VENDOR") {
    delete copy.sale;
    delete copy.sale_voucher_no;
  }
  return copy;
}

export function stripCostingTabForAudience(
  data: {
    lines?: Record<string, unknown>[];
    [key: string]: unknown;
  },
  audience: CostingVisibilityAudience,
) {
  if (audience === "STAFF") return data;
  const stripped: Record<string, unknown> = {
    ...data,
    lines: (data.lines ?? []).map((l) => applyCostingVisibility(l, audience)),
  };
  if (audience === "CUSTOMER") {
    delete stripped.cost_total;
    if (stripped.actions && typeof stripped.actions === "object") {
      stripped.actions = {
        ...(stripped.actions as Record<string, unknown>),
        cost: false,
      };
    }
  }
  if (audience === "VENDOR") {
    delete stripped.revenue_total;
    delete stripped.sale_total;
    if (stripped.actions && typeof stripped.actions === "object") {
      stripped.actions = {
        ...(stripped.actions as Record<string, unknown>),
        sale: false,
      };
    }
    // Hide GP when sale side is hidden
    delete stripped.gp_amount;
    delete stripped.gp_percent;
  }
  return stripped;
}

