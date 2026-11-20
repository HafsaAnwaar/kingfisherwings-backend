import { ForbiddenException } from "@nestjs/common";
import { InvoiceType } from "@prisma/client";
import { seesAllJobDepartments } from "../../../common/utils/job-type-access.util";

export type InvoiceSideFlags = {
  can_see_sale_invoices: boolean;
  can_see_purchase_invoices: boolean;
};

/** Sale-side invoice types (AR). */
export const SALE_INVOICE_TYPES: InvoiceType[] = [
  "CUSTOMER_INVOICE",
  "DEBIT_NOTE",
];

/** Purchase-side invoice types (AP). */
export const PURCHASE_INVOICE_TYPES: InvoiceType[] = [
  "PURCHASE_INVOICE",
  "CREDIT_NOTE",
];

export function isSaleInvoiceType(type: InvoiceType | string): boolean {
  return (SALE_INVOICE_TYPES as string[]).includes(type);
}

export function isPurchaseInvoiceType(type: InvoiceType | string): boolean {
  return (PURCHASE_INVOICE_TYPES as string[]).includes(type);
}

/** Invoice types the actor may access (null = all / unrestricted). */
export function invoiceTypesAllowed(
  flags: InvoiceSideFlags | null | undefined,
  opts?: { role?: string | null; permissions?: string[] | null },
): InvoiceType[] | null {
  if (seesAllJobDepartments(opts?.role, opts?.permissions)) return null;
  if (!flags) return [];
  const out: InvoiceType[] = [];
  if (flags.can_see_sale_invoices) out.push(...SALE_INVOICE_TYPES);
  if (flags.can_see_purchase_invoices) out.push(...PURCHASE_INVOICE_TYPES);
  return out;
}

export function assertInvoiceSideAccess(
  invoiceType: InvoiceType | string,
  flags: InvoiceSideFlags | null | undefined,
  opts?: { role?: string | null; permissions?: string[] | null },
): void {
  const allowed = invoiceTypesAllowed(flags, opts);
  if (allowed === null) return;
  if (!allowed.includes(invoiceType as InvoiceType)) {
    throw new ForbiddenException(
      isSaleInvoiceType(invoiceType)
        ? "Sale invoices are not available for this user (can_see_sale_invoices=false)."
        : isPurchaseInvoiceType(invoiceType)
          ? "Purchase invoices are not available for this user (can_see_purchase_invoices=false)."
          : `Invoice type ${invoiceType} is not available for this user.`,
    );
  }
}

export function hasAnyInvoiceSide(
  flags: InvoiceSideFlags | null | undefined,
  opts?: { role?: string | null; permissions?: string[] | null },
): boolean {
  const allowed = invoiceTypesAllowed(flags, opts);
  return allowed === null || allowed.length > 0;
}
