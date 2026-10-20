/** Build a unique UPPER_SNAKE catalog code from a human label. */
export function codeFromStatusLabel(label: string, maxLen = 40): string {
  const base = label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
  const code = (base || "CUSTOM_STATUS").slice(0, maxLen);
  if (/^[A-Z]/.test(code)) return code;
  return `S_${code}`.slice(0, maxLen);
}

/** Normalize an optional client-supplied code. */
export function normalizeStatusCode(
  raw: string | undefined,
  label: string,
): string {
  if (raw?.trim()) {
    return codeFromStatusLabel(raw.trim());
  }
  return codeFromStatusLabel(label);
}
