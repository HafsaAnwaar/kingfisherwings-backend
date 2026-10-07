import { QuotationStatus } from "@prisma/client";

const CUSTOMER_OUTCOME_ALLOWED: QuotationStatus[] = [
  "SENT",
  "CUSTOMER_REVIEW",
  "NEGOTIATING",
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
    /** Convert only after accept (APPROVED) + booking form submit. */
    can_convert_to_job: status === "APPROVED",
  };
}

export { CUSTOMER_OUTCOME_ALLOWED };
