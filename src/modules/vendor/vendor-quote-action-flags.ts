import { VendorQuoteStatus } from "@prisma/client";

const VENDOR_ACTIONABLE: VendorQuoteStatus[] = [
  "SENT",
  "VENDOR_REVIEW",
  "NEGOTIATING",
  "PRICED",
];

const TENANT_CAN_ACCEPT: VendorQuoteStatus[] = ["NEGOTIATING", "PRICED"];
const TENANT_CAN_REVISE: VendorQuoteStatus[] = [
  "SENT",
  "NEGOTIATING",
  "VENDOR_REVIEW",
  "PRICED",
];

/** UI action flags mirroring customer quotation negotiation. */
export function vendorQuoteActionFlags(status: VendorQuoteStatus) {
  const vendorCanAct = VENDOR_ACTIONABLE.includes(status);
  return {
    can_vendor_accept: vendorCanAct,
    can_vendor_reject: vendorCanAct,
    can_vendor_negotiate: vendorCanAct,
    can_admin_accept: TENANT_CAN_ACCEPT.includes(status),
    can_admin_reject: TENANT_CAN_ACCEPT.includes(status),
    can_admin_negotiate: TENANT_CAN_REVISE.includes(status),
    can_share_invoice: status === "APPROVED",
    can_upload_payment_proof: status === "APPROVED",
  };
}
