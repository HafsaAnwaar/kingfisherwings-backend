/** Minimal CSV helpers for portal exports. */

export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str =
    value instanceof Date
      ? value.toISOString()
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(headers: string[], rows: Array<Array<unknown>>): string {
  const lines = [
    headers.map(csvEscape).join(','),
    ...rows.map((row) => row.map(csvEscape).join(',')),
  ];
  return `${lines.join('\n')}\n`;
}

export const PORTAL_CSV_EXPORT_MAX_ROWS = 5000;
