export type DashboardPeriodPreset = "7d" | "30d" | "mtd" | "custom";

export type DashboardPeriodInput = {
  period?: DashboardPeriodPreset | string | null;
  from_date?: string | null;
  to_date?: string | null;
};

export type ResolvedDashboardPeriod = {
  from: Date;
  to: Date;
  period: DashboardPeriodPreset;
};

/**
 * Resolve dashboard date window.
 * Defaults: `defaultPeriod` when period/dates omitted (CRM-style 30d, MIS-style mtd).
 */
export function resolveDashboardPeriod(
  input: DashboardPeriodInput = {},
  defaultPeriod: DashboardPeriodPreset = "30d",
): ResolvedDashboardPeriod {
  const to = input.to_date ? endOfDay(new Date(input.to_date)) : endOfDay(new Date());
  const raw = (input.period ?? defaultPeriod).toString().toLowerCase();

  if (raw === "custom" || (input.from_date && !input.period)) {
    if (!input.from_date) {
      // custom without from → treat as default preset
      return resolveDashboardPeriod(
        { period: defaultPeriod, to_date: input.to_date },
        defaultPeriod,
      );
    }
    return {
      from: startOfDay(new Date(input.from_date)),
      to,
      period: "custom",
    };
  }

  if (raw === "7d") {
    const from = startOfDay(addDays(to, -6));
    return { from, to, period: "7d" };
  }

  if (raw === "mtd") {
    const from = startOfDay(new Date(to.getFullYear(), to.getMonth(), 1));
    return { from, to, period: "mtd" };
  }

  // 30d default
  const from = startOfDay(addDays(to, -29));
  return { from, to, period: "30d" };
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
