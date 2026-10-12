import { JobDateSource, JobType } from "@prisma/client";

const IMPORT_SUFFIX = /_IMPORT$|IMPORT$/;
const EXPORT_SUFFIX = /_EXPORT$|EXPORT$/;

export function resolveJobDate(input: {
  job_date_source: JobDateSource;
  job_type: JobType;
  etd?: Date | null;
  eta?: Date | null;
  at?: Date;
}): Date {
  const now = input.at ?? new Date();
  const day = (d: Date) =>
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

  if (input.job_date_source === "SYSTEM_DATE") {
    return day(now);
  }

  const type = String(input.job_type);
  const isImport = IMPORT_SUFFIX.test(type) || type === "AIR_IMPORT";
  const isExport = EXPORT_SUFFIX.test(type) || type === "AIR_EXPORT";

  if (input.job_date_source === "ETA_ATA" && isImport && input.eta) {
    return day(input.eta);
  }
  if (input.job_date_source === "ETD_ATD" && isExport && input.etd) {
    return day(input.etd);
  }

  if (input.eta) return day(input.eta);
  if (input.etd) return day(input.etd);
  return day(now);
}
