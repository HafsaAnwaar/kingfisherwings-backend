/**
 * Extra storage days past the paid/included window.
 * Example: paid 10 days, elapsed 15 → extra = 5.
 */
export function computeExtraStorageDays(
  elapsedDays: number,
  paidStorageDays: number,
): number {
  return Math.max(0, elapsedDays - paidStorageDays);
}

/**
 * Overdue amount = extra_days × overdue_rate_per_day × basis (cbm or qty).
 */
export function computeOverdueStorageAmount(
  extraDays: number,
  overdueRatePerDay: number,
  basis: number,
): number {
  if (extraDays <= 0 || overdueRatePerDay <= 0 || basis <= 0) return 0;
  return extraDays * overdueRatePerDay * basis;
}
