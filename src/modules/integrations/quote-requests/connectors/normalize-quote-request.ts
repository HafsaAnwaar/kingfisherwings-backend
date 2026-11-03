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

function commodityFromItems(items: unknown): string | null {
  if (!Array.isArray(items) || items.length === 0) return null;
  const parts: string[] = [];
  for (const raw of items) {
    const it = asRecord(raw);
    if (!it) continue;
    const name = pickString(it, ["name", "product_name", "title"]);
    const qty = pickString(it, ["quantity", "qty"]);
    const unit = pickString(it, ["unit"]);
    const sku = pickString(it, ["sku"]);
    if (!name && !sku) continue;
    const bit = [qty, unit, name || sku].filter(Boolean).join(" ");
    parts.push(bit);
  }
  return parts.length ? parts.join("; ").slice(0, 300) : null;
}

/**
 * Map KFPP / KFQA / generic website inquiry payloads into a stable shape.
 * Unknown fields remain on `raw` (full remote document for FE).
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

  const customer = asRecord(obj.customer);

  const contactName =
    pickString(obj, [
      "contact_name",
      "name",
      "full_name",
      "customer_name",
      "contactName",
    ]) ?? (customer ? pickString(customer, ["name", "full_name"]) : null);

  const contactEmail =
    (
      pickString(obj, [
        "contact_email",
        "email",
        "customer_email",
        "contactEmail",
      ]) ?? (customer ? pickString(customer, ["email"]) : null)
    )?.toLowerCase() ?? null;

  const contactPhone =
    pickString(obj, [
      "contact_phone",
      "phone",
      "mobile",
      "tel",
      "contactPhone",
    ]) ?? (customer ? pickString(customer, ["phone", "mobile", "tel"]) : null);

  const companyName =
    pickString(obj, [
      "company_name",
      "company",
      "organisation",
      "organization",
      "companyName",
    ]) ?? (customer ? pickString(customer, ["company", "company_name"]) : null);

  const customerType = customer
    ? pickString(customer, ["type", "customer_type"])
    : pickString(obj, ["customer_type"]);

  const message = pickString(obj, [
    "message",
    "notes",
    "comments",
    "description",
    "enquiry",
    "details",
  ]);

  const commodity =
    pickString(obj, [
      "commodity",
      "cargo",
      "product",
      "goods",
      "subject",
    ]) ?? commodityFromItems(obj.items);

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
    reference: pickString(obj, ["reference", "ref", "quote_number"]),
    source: pickString(obj, ["source"]),
    source_label: pickString(obj, ["source_label", "sourceLabel"]),
    software_ref: pickString(obj, ["software_ref", "softwareRef"]),
    customer_type: customerType,
    page_url: pickString(obj, ["page_url", "pageUrl", "url"]),
    admin_url: pickString(obj, ["admin_url", "adminUrl"]),
    raw: obj,
  };
}

export function normalizeQuoteRequestList(payload: unknown): {
  total: number;
  pages?: number;
  items: NormalizedQuoteRequest[];
} {
  const obj = asRecord(payload);
  const dataObj = asRecord(obj?.data);
  const rawItems = Array.isArray(payload)
    ? payload
    : Array.isArray(obj?.items)
      ? obj!.items
      : Array.isArray(obj?.data)
        ? obj!.data
        : Array.isArray(dataObj?.items)
          ? dataObj!.items
          : Array.isArray(obj?.quotes)
            ? obj!.quotes
            : Array.isArray(obj?.results)
              ? obj!.results
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
  const pages =
    typeof obj?.pages === "number"
      ? obj.pages
      : typeof obj?.total_pages === "number"
        ? obj.total_pages
        : undefined;
  return { total, pages, items };
}
