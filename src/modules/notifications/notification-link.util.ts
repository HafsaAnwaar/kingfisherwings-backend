/**
 * Audience-aware deep links for in-app notifications.
 * Prefer a stored `link_path`; otherwise derive from entity_type + entity_id.
 */

export type NotificationAudience = "STAFF" | "PORTAL" | "VENDOR";

export type ResolveNotificationLinkInput = {
  audience: NotificationAudience;
  entity_type?: string | null;
  entity_id?: string | null;
  link_path?: string | null;
};

function normType(entityType: string | null | undefined): string {
  return (entityType ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
}

const HUBS: Record<NotificationAudience, Record<string, string>> = {
  STAFF: {
    quotation: "/quotations",
    invoice: "/invoices",
    purchase_invoice: "/purchase-invoices",
    payment: "/gl/payments",
    payment_proof: "/invoices",
    job: "/jobs",
    shipment: "/shipments",
    enquiry: "/crm/enquiries",
    lead: "/crm/leads",
    follow_up: "/crm/follow-ups",
    portal_message: "/portal-admin/messages",
    portal_dispute: "/portal-admin/disputes",
    vendor_dispute: "/vendor-admin/disputes",
    credit_limit_request: "/portal-admin/credit-limit-requests",
    vendorquote: "/jobs",
    vendor_quote: "/jobs",
    cheque: "/gl/cheques",
    campaign: "/crm/campaigns",
    billing: "/billing/invoices",
    platform_invoice: "/billing/invoices",
    employee: "/hr/employees",
    hr_employee: "/hr/employees",
    timesheet: "/hr/timesheets",
    hr_timesheet: "/hr/timesheets/missing",
    wms: "/wms/stock/low-stock",
    wms_item: "/wms/stock/low-stock",
    default: "/notifications",
  },
  PORTAL: {
    quotation: "/portal/quotations",
    invoice: "/portal/invoices",
    payment: "/portal/payments",
    payment_proof: "/portal/invoices",
    job: "/portal/shipments",
    shipment: "/portal/shipments",
    portal_message: "/portal/messages",
    portal_dispute: "/portal/disputes",
    credit_limit_request: "/portal/credit/limit-requests",
    cheque: "/portal/payments",
    default: "/portal/notifications",
  },
  VENDOR: {
    vendorquote: "/vendor/job-offers",
    vendor_quote: "/vendor/job-offers",
    invoice: "/vendor/invoices",
    purchase_invoice: "/vendor/invoices",
    payment: "/vendor/payments",
    payment_proof: "/vendor/invoices",
    vendor_dispute: "/vendor/disputes",
    job: "/vendor/jobs",
    default: "/vendor/notifications",
  },
};

/** Detail path templates keyed by normalized entity type. */
function detailPath(
  audience: NotificationAudience,
  type: string,
  id: string,
): string | null {
  const maps: Record<NotificationAudience, Record<string, string>> = {
    STAFF: {
      quotation: `/quotations/${id}`,
      invoice: `/invoices/${id}`,
      purchase_invoice: `/purchase-invoices/${id}`,
      payment: `/gl/payments/${id}`,
      payment_proof: `/invoices/${id}`,
      job: `/jobs/${id}`,
      shipment: `/shipments/${id}`,
      enquiry: `/crm/enquiries/${id}`,
      lead: `/crm/leads/${id}`,
      follow_up: `/crm/follow-ups/${id}`,
      portal_message: `/portal-admin/messages/${id}`,
      portal_dispute: `/portal-admin/disputes/${id}`,
      vendor_dispute: `/vendor-admin/disputes/${id}`,
      credit_limit_request: `/portal-admin/credit-limit-requests/${id}`,
      vendorquote: `/jobs/${id}`,
      vendor_quote: `/jobs/${id}`,
      cheque: `/gl/cheques/${id}`,
      campaign: `/crm/campaigns/${id}`,
      billing: `/billing/invoices/${id}`,
      platform_invoice: `/billing/invoices/${id}`,
      employee: `/hr/employees/${id}`,
      hr_employee: `/hr/employees/${id}`,
    },
    PORTAL: {
      quotation: `/portal/quotations/${id}`,
      invoice: `/portal/invoices/${id}`,
      payment: `/portal/payments`,
      payment_proof: `/portal/invoices/${id}`,
      job: `/portal/shipments/${id}`,
      shipment: `/portal/shipments/${id}`,
      job_document: `/portal/shipments/${id}/documents`,
      portal_message: `/portal/messages/${id}`,
      portal_dispute: `/portal/disputes/${id}`,
      credit_limit_request: `/portal/credit/limit-requests`,
      cheque: `/portal/payments`,
    },
    VENDOR: {
      vendorquote: `/vendor/job-offers/${id}`,
      vendor_quote: `/vendor/job-offers/${id}`,
      invoice: `/vendor/invoices/${id}`,
      purchase_invoice: `/vendor/invoices/${id}`,
      payment: `/vendor/payments`,
      payment_proof: `/vendor/invoices/${id}`,
      vendor_dispute: `/vendor/disputes/${id}`,
      job: `/vendor/jobs/${id}`,
    },
  };
  return maps[audience][type] ?? null;
}

/**
 * Resolve the SPA-relative path for a notification.
 * Stored `link_path` always wins when non-empty.
 */
export function resolveNotificationLink(
  input: ResolveNotificationLinkInput,
): string | null {
  const stored = input.link_path?.trim();
  if (stored) return stored;

  const type = normType(input.entity_type);
  const id = input.entity_id?.trim() || null;
  const hubs = HUBS[input.audience];

  if (id && type) {
    const detail = detailPath(input.audience, type, id);
    if (detail) return detail;
  }

  if (type && hubs[type]) return hubs[type];
  return hubs.default ?? null;
}

/** Ensure emit payload has a link_path when entity hints exist. */
export function ensureEmitLinkPath(
  audience: NotificationAudience,
  input: {
    entity_type?: string;
    entity_id?: string;
    link_path?: string;
  },
): string | undefined {
  const resolved = resolveNotificationLink({
    audience,
    entity_type: input.entity_type,
    entity_id: input.entity_id,
    link_path: input.link_path,
  });
  return resolved ?? undefined;
}
