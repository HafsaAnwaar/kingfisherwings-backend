/**
 * Build a CODE128-safe barcode value from a job number.
 * Strips non-alphanumeric characters and prefixes `JB` so the printed
 * CODE128 string is not equal to `job_number` (public /track resolves by
 * job number / AWB / BL / tracking — not by staff barcode).
 */
export function barcodeFromJobNumber(jobNumber: string): string {
  const cleaned = jobNumber.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const base = cleaned || `JOB${Date.now().toString(36).toUpperCase()}`;
  if (base.startsWith("JB")) return base;
  return `JB${base}`;
}
