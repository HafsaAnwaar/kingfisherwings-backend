import {
  InvoiceStatus,
  InvoiceType,
  OnlinePaymentStatus,
} from "@prisma/client";

/** Account reference used for the platform's own Stripe account (env keys). */
export const PLATFORM_ACCOUNT_REF = "platform";

export const tenantAccountRef = (gatewayId: string) => `tenant:${gatewayId}`;

/** Stripe metadata keys written on every Checkout Session / PaymentIntent. */
export const STRIPE_METADATA = {
  SCOPE: "erp_scope",
  TENANT_ID: "tenant_id",
  INVOICE_ID: "invoice_id",
  PAYMENT_ID: "payment_id",
  PARTY_ID: "party_id",
  INVOICE_NUMBER: "invoice_number",
  PAYMENT_TYPE: "payment_type",
  PLAN_ID: "billing_plan_id",
} as const;

/** Values for STRIPE_METADATA.SCOPE. */
export const METADATA_SCOPE = {
  TENANT_INVOICE: "tenant_invoice",
  PLATFORM_INVOICE: "platform_invoice",
  PLATFORM_SUBSCRIPTION: "platform_subscription",
} as const;

/** Customer-side invoices that can be settled online. */
export const ONLINE_PAYABLE_INVOICE_TYPES: InvoiceType[] = [
  "CUSTOMER_INVOICE",
  "DEBIT_NOTE",
];

export const ONLINE_PAYABLE_INVOICE_STATUSES: InvoiceStatus[] = [
  "POSTED",
  "SENT",
  "PARTIALLY_PAID",
];

/** Attempts that still hold an open Stripe Checkout Session. */
export const OPEN_ATTEMPT_STATUSES: OnlinePaymentStatus[] = [
  "PENDING",
  "REQUIRES_ACTION",
];

/** Attempts whose money has (or may still) move — block new checkouts. */
export const IN_FLIGHT_ATTEMPT_STATUSES: OnlinePaymentStatus[] = ["PROCESSING"];

export const SETTLED_ATTEMPT_STATUSES: OnlinePaymentStatus[] = [
  "PAID",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
];

/** Stripe Checkout sessions live at most 24h; we default to 1h. */
export const CHECKOUT_SESSION_TTL_SECONDS = 60 * 60;

export const PAYMENT_LINK_DEFAULT_TTL_DAYS = 30;
export const PAYMENT_LINK_MAX_TTL_DAYS = 90;

/** If a posting claim is older than this, another worker may take over. */
export const ERP_POSTING_CLAIM_STALE_MS = 5 * 60 * 1000;
export const WEBHOOK_PROCESSING_STALE_MS = 5 * 60 * 1000;

export const PAYMENT_PROOF_MAX_BYTES = 8 * 1024 * 1024;
export const PAYMENT_PROOF_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
