/**
 * Which staff requests count as a business activity worth an email, and
 * how to describe them. Kept in one place so modules need no changes.
 */

export const STAFF_ACTIVITY_QUEUE = "staff-activity-email";

export const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Route patterns (Express route path) that are not business activities:
 * auth/session, the admin's own preferences, reads implemented as POST
 * (search, previews, exports, PDF/report rendering), notification
 * housekeeping, and line-item edits inside a draft document.
 */
export const IGNORED_ROUTES: RegExp[] = [
  /^\/auth(\/|$)/,
  /^\/portal(\/|$)/,
  /^\/vendor\/auth(\/|$)/,
  /^\/pay(\/|$)/,
  /^\/payments\/stripe\/webhook/,
  /^\/platform(\/|$)/,
  /^\/tenants(\/|$)/,
  /^\/notifications(\/|$)/,
  /^\/(search|tools|locale|favorites|track|health)(\/|$)/,
  /^\/masters\/favorites/,
  /^\/(reports|saved-reports|gl\/saved-reports)(\/|$)/,
  /\/preferences(\/|$)/,
  /\/(pdf|preview|export|export\.csv|format-payload|validate|calculate|price|pricing)(\/|$)/,
  /\/(read|mark-read|read-all|mark-all-read)(\/|$)/,
  /\/lines(\/|$)/,
  /\/stripe\/(reconcile|settings\/rotate-webhook)$/,
];

/** Friendly entity names for route prefixes (longest prefix wins). */
const ENTITY_LABELS: Array<[string, string]> = [
  ["gl/payments", "Payment"],
  ["gl/vouchers", "Voucher"],
  ["gl/accounts", "GL Account"],
  ["gl/cheques", "Cheque"],
  ["gl/bank-reconciliations", "Bank Reconciliation"],
  ["invoices", "Invoice"],
  ["purchase-invoices", "Purchase Invoice"],
  ["credit-notes", "Credit Note"],
  ["debit-notes", "Debit Note"],
  ["payment-requests", "Payment Request"],
  ["payment-proofs", "Payment Proof"],
  ["payments", "Online Payment"],
  ["quotations", "Quotation"],
  ["jobs", "Job"],
  ["parties", "Party"],
  ["users", "User"],
  ["roles", "Role"],
  ["companies", "Company"],
  ["organization", "Organization Settings"],
  ["documentation", "Document"],
  ["wms", "Warehouse Record"],
  ["transport", "Transport Record"],
  ["nvocc", "NVOCC Record"],
  ["awb-stock", "AWB Stock"],
  ["crm", "CRM Record"],
  ["hr", "HR Record"],
  ["masters", "Master Data"],
];

const VERBS: Record<string, string> = {
  post: "Posted",
  send: "Sent",
  "send-email": "Emailed",
  approve: "Approved",
  reject: "Rejected",
  cancel: "Cancelled",
  submit: "Submitted",
  "mark-paid": "Marked Paid",
  reverse: "Reversed",
  complete: "Completed",
  close: "Closed",
  reopen: "Reopened",
  convert: "Converted",
  assign: "Assigned",
  acknowledge: "Acknowledged",
  restore: "Restored",
  activate: "Activated",
  deactivate: "Deactivated",
  status: "Changed Status of",
  "credit-status": "Changed Credit Status of",
  "payment-proofs": "Uploaded Payment Proof for",
  "payment-link": "Created Payment Link for",
  pay: "Started Online Payment for",
  refund: "Refunded",
  retry: "Retried Payment for",
  allocations: "Allocated",
  documents: "Uploaded Document for",
  upload: "Uploaded",
  permissions: "Changed Permissions of",
  "reset-password": "Reset Password of",
};

const titleCase = (s: string) =>
  s
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

export interface DescribedActivity {
  action: string;
  entity: string;
  /** Front-end path of the affected record, when it can be derived. */
  linkPath: string | null;
}

/** Describes a mutation from its route pattern, method and response. */
export function describeActivity(
  routePath: string,
  method: string,
  params: Record<string, string>,
  body: Record<string, unknown> | null,
): DescribedActivity {
  const segments = routePath.split("/").filter(Boolean);
  const staticPath = segments.filter((s) => !s.startsWith(":")).join("/");

  let entity = "Record";
  let matched = "";
  for (const [prefix, label] of ENTITY_LABELS) {
    if (
      (staticPath === prefix || staticPath.startsWith(`${prefix}/`)) &&
      prefix.length > matched.length
    ) {
      entity = label;
      matched = prefix;
    }
  }
  if (!matched && segments[0]) {
    entity = titleCase(segments[0].replace(/s$/, ""));
  }
  if (entity === "Party" && body) {
    const t = String(body.party_type ?? "");
    entity =
      t === "CUSTOMER" ? "Customer" : t === "SUPPLIER" ? "Vendor" : "Party";
  }

  const firstParamIdx = segments.findIndex((s) => s.startsWith(":"));
  const tail = segments
    .slice(Math.max(firstParamIdx, 0) + (firstParamIdx >= 0 ? 1 : 0))
    .filter((s) => !s.startsWith(":"));
  const verbKey = firstParamIdx >= 0 ? tail[tail.length - 1] : undefined;

  let action: string;
  if (verbKey && VERBS[verbKey]) {
    action = `${VERBS[verbKey]} ${entity}`;
  } else if (method === "DELETE") {
    action = `Deleted ${entity}`;
  } else if (method === "POST" && firstParamIdx < 0) {
    const last = segments[segments.length - 1];
    action =
      last && VERBS[last] && segments.length > 1
        ? `${VERBS[last]} ${entity}`
        : last === "import"
          ? `Imported ${entity} records`
          : `Created ${entity}`;
  } else if (verbKey) {
    action = `Updated ${entity} (${titleCase(verbKey)})`;
  } else {
    action = `Updated ${entity}`;
  }

  // Link: the route up to its first id, with the real id substituted.
  let linkPath: string | null = null;
  const bodyId = typeof body?.id === "string" ? body.id : null;
  if (method !== "DELETE") {
    if (firstParamIdx >= 0) {
      const name = segments[firstParamIdx].slice(1);
      const value = params[name];
      if (value)
        linkPath = `/${[...segments.slice(0, firstParamIdx), value].join("/")}`;
    } else if (bodyId) {
      linkPath = `/${[...segments, bodyId].join("/")}`;
    }
  }
  return { action, entity, linkPath };
}

/** Reference number / name of the affected record from the response. */
export function pickReference(
  body: Record<string, unknown> | null,
): string | null {
  if (!body) return null;
  const keys = [
    "invoice_number",
    "quotation_number",
    "job_number",
    "payment_number",
    "voucher_number",
    "request_number",
    "booking_number",
    "cheque_number",
    "reference_number",
    "code",
    "name",
    "email",
  ];
  for (const k of keys) {
    const v = body[k];
    if (typeof v === "string" && v.trim()) return v.slice(0, 120);
  }
  return null;
}

/** The record from a response: raw entity, `{ data: entity }` or `{ success, data }`. */
export function unwrapBody(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const obj = body as Record<string, unknown>;
  const data = obj.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return obj;
}
