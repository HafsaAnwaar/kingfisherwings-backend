/** GCC countries typically observe Fri–Sat weekend; others Sat–Sun. */
const FRI_SAT_WEEKEND = new Set(["AE", "SA", "QA", "BH", "OM", "KW"]);

export function isWeekend(date: Date, countryCode?: string | null): boolean {
  const day = date.getUTCDay();
  if (countryCode && FRI_SAT_WEEKEND.has(countryCode.toUpperCase())) {
    return day === 5 || day === 6;
  }
  return day === 0 || day === 6;
}

export function toUtcDateOnly(input: string | Date): Date {
  if (input instanceof Date) {
    return new Date(
      Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()),
    );
  }
  const [y, m, d] = input.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function countBusinessDays(
  start: Date,
  end: Date,
  holidaySet: Set<string>,
  countryCode?: string | null,
): number {
  let count = 0;
  const cursor = new Date(start.getTime());
  while (cursor.getTime() <= end.getTime()) {
    const key = formatDateOnly(cursor);
    if (!isWeekend(cursor, countryCode) && !holidaySet.has(key)) {
      count += 1;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

export function daysBetweenInclusive(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / 86_400_000) + 1;
}

/** UAE EOS gratuity (unlimited contract): 21 days/year first 5 years, 30 thereafter on basic. */
export function calculateUaeGratuity(
  basicSalary: number,
  serviceYears: number,
): {
  service_years: number;
  days_entitled: number;
  amount: number;
} {
  const years = Math.max(0, serviceYears);
  const firstFive = Math.min(years, 5);
  const afterFive = Math.max(0, years - 5);
  const days = firstFive * 21 + afterFive * 30;
  const daily = basicSalary / 30;
  return {
    service_years: Number(years.toFixed(4)),
    days_entitled: Number(days.toFixed(4)),
    amount: Number((daily * days).toFixed(4)),
  };
}

export function alertBandForDays(
  daysUntilExpiry: number,
): "D90" | "D60" | "D30" | "D7" | "EXPIRED" | null {
  if (daysUntilExpiry < 0) return "EXPIRED";
  if (daysUntilExpiry <= 7) return "D7";
  if (daysUntilExpiry <= 30) return "D30";
  if (daysUntilExpiry <= 60) return "D60";
  if (daysUntilExpiry <= 90) return "D90";
  return null;
}
