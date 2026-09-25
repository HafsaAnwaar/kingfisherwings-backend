/**
 * Build a CODE128-safe barcode value from a job number.
 * Strips non-alphanumeric characters so scanners accept the string.
 */
export function barcodeFromJobNumber(jobNumber: string): string {
  const cleaned = jobNumber.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return cleaned || `JOB${Date.now().toString(36).toUpperCase()}`;
}
