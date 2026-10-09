import { QuotationStatus } from "@prisma/client";

const CUSTOMER_OUTCOME_ALLOWED: QuotationStatus[] = [
  "SENT",
  "CUSTOMER_REVIEW",
  "NEGOTIATING",
];

/** Statuses from which staff can mark Fresa Verified. */
const VERIFY_ALLOWED: QuotationStatus[] = [
  "SENT",
  "CUSTOMER_REVIEW",
  "NEGOTIATING",
  "INTERNALLY_APPROVED",
];

/** UI action flags for customer vs staff after quote is sent. */
export function quotationActionFlags(status: QuotationStatus) {
  const customerCanAct = CUSTOMER_OUTCOME_ALLOWED.includes(status);
  return {
    can_accept: customerCanAct,
    can_reject: customerCanAct,
    can_negotiate: customerCanAct,
    can_admin_accept: status === "NEGOTIATING",
    can_admin_reject: status === "NEGOTIATING",
    /** Staff Fresa Verified gate before Approved / Generate Shipment. */
    can_verify: VERIFY_ALLOWED.includes(status),
    /** Generate Shipment requires Approved (Fresa). */
    can_generate_shipment: status === "APPROVED",
    /** Optional direct Generate Job from quote (Fresa still allows). */
    can_generate_job: status === "APPROVED",
    /** Convert only after accept (APPROVED) + booking form submit. */
    can_convert_to_job: status === "APPROVED",
  };
}

export { CUSTOMER_OUTCOME_ALLOWED, VERIFY_ALLOWED };
