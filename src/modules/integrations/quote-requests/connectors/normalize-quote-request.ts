import { NormalizedQuoteRequest } from "./quote-request-connector.interface";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function pickString(
  obj: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return null;
}

function pickDate(
  obj: Record<string, unknown>,
  keys: string[],
): Date | null {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "string" || typeof v === "number") {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }
  return null;
}

/**
 * Map KFPP / generic website inquiry payloads into a stable shape.
 * Unknown fields remain on `raw`. Sample WP items were empty at discovery;
 * common WordPress / form field aliases are covered.
 */
export function normalizeQuoteRequestItem(
  item: unknown,
): NormalizedQuoteRequest | null {
  const obj = asRecord(item);
  if (!obj) return null;

  const externalId = pickString(obj, [
    "id",
    "ID",
    "quote_id",
    "request_id",
    "external_id",
  ]);
  if (!externalId) return null;

  const contactName = pickString(obj, [
    "contact_name",
    "name",
    "full_name",
    "customer_name",
    "contactName",
  ]);
  const contactEmail = pickString(obj, [
    "contact_email",
    "email",
    "customer_email",
    "contactEmail",
  ])?.toLowerCase() ?? null;
  const contactPhone = pickString(obj, [
    "contact_phone",
    "phone",
    "mobile",
    "tel",
    "contactPhone",
  ]);
  const companyName = pickString(obj, [
    "company_name",
    "company",
    "organisation",
    "organization",
    "companyName",
  ]);
  const message = pickString(obj, [
    "message",
    "notes",
    "comments",
    "description",
    "enquiry",
    "details",
  ]);
  const commodity = pickString(obj, [
    "commodity",
    "cargo",
    "product",
    "goods",
    "subject",
  ]);
  const status = pickString(obj, ["status", "state", "quote_status"]);
  const submittedAt = pickDate(obj, [
    "submitted_at",
    "created_at",
    "date",
    "created",
    "posted_at",
  ]);

  return {
    external_id: externalId,
    status,
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    company_name: companyName,
    message,
    commodity,
    submitted_at: submittedAt,
    raw: obj,
  };
}

export function normalizeQuoteRequestList(payload: unknown): {
  total: number;
  items: NormalizedQuoteRequest[];
} {
  const obj = asRecord(payload);
  const rawItems = Array.isArray(payload)
    ? payload
    : Array.isArray(obj?.items)
      ? obj!.items
      : Array.isArray(obj?.data)
        ? obj!.data
        : [];
  const items = rawItems
    .map((item) => normalizeQuoteRequestItem(item))
    .filter((x): x is NormalizedQuoteRequest => Boolean(x));
  const total =
    typeof obj?.total === "number"
      ? obj.total
      : typeof obj?.count === "number"
        ? obj.count
        : items.length;
  return { total, items };
}
