import { CostingVisibilityAudience } from "../dto/job-costing.dto";

/** Strip sale or cost side for portal/vendor audiences. */
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
  return {
    ...data,
    lines: (data.lines ?? []).map((l) => applyCostingVisibility(l, audience)),
  };
}
