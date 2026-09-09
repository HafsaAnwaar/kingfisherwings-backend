export type OnTimeJobLike = {
  eta?: Date | string | null;
  status?: string | null;
  actual_eta?: Date | string | null;
  actual_delivery?: Date | string | null;
};

export type OnTimeSummary = {
  on_time_percent: number | null;
  on_time_jobs: number;
  late_jobs: number;
  scored_jobs: number;
};

const TERMINAL_DELIVERED = new Set(["DELIVERED", "COMPLETED"]);

/**
 * Score jobs whose ETA falls in the period.
 * On-time when actual delivery / actual_eta is set and <= eta.
 * Jobs still open without actual are not scored (unless overdue past eta — count as late when status terminal is missing but eta passed and we have no actual — plan says scored if delivered/completed or actual_eta set).
 */
export function summarizeOnTimePerformance(
  jobs: OnTimeJobLike[],
  asOf: Date = new Date(),
): OnTimeSummary {
  let onTime = 0;
  let late = 0;

  for (const job of jobs) {
    if (!job.eta) continue;
    const eta = toDate(job.eta);
    if (!eta) continue;

    const actual =
      toDate(job.actual_delivery) ?? toDate(job.actual_eta) ?? null;
    const isTerminal = job.status
      ? TERMINAL_DELIVERED.has(job.status)
      : false;

    if (!actual && !isTerminal) {
      // Not yet scored
      continue;
    }

    const compare = actual ?? asOf;
    if (compare.getTime() <= eta.getTime()) {
      onTime += 1;
    } else {
      late += 1;
    }
  }

  const scored = onTime + late;
  return {
    on_time_percent:
      scored > 0 ? Math.round((onTime / scored) * 10000) / 100 : null,
    on_time_jobs: onTime,
    late_jobs: late,
    scored_jobs: scored,
  };
}

function toDate(v: Date | string | null | undefined): Date | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const DEFAULT_OPS_CAPACITY = 25;

export const OPEN_JOB_STATUSES = [
  "ENQUIRY",
  "QUOTATION",
  "BOOKING_CONFIRMED",
  "IN_PROGRESS",
  "DOCS_PENDING",
  "CUSTOMS_CLEARANCE",
  "ON_HOLD",
] as const;

export const TERMINAL_JOB_STATUSES = [
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
] as const;
