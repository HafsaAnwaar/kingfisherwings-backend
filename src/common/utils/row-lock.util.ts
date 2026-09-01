import { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export async function lockInvoiceRow(
  tx: Tx,
  tenantId: string,
  invoiceId: string,
) {
  const rows = await tx.$queryRaw<
    Array<{
      id: string;
      balance_due: unknown;
      amount_paid: unknown;
      status: string;
      total_amount: unknown;
      invoice_type: string;
      credited_invoice_id: string | null;
    }>
  >`
    SELECT id, balance_due, amount_paid, status, total_amount, invoice_type, credited_invoice_id
    FROM invoices
    WHERE tenant_id = ${tenantId}::uuid
      AND id = ${invoiceId}::uuid
      AND deleted_at IS NULL
    FOR UPDATE
  `;
  return rows[0] ?? null;
}

export async function lockPaymentRow(
  tx: Tx,
  tenantId: string,
  paymentId: string,
) {
  const rows = await tx.$queryRaw<
    Array<{ id: string; status: string; amount: unknown; direction: string }>
  >`
    SELECT id, status, amount, direction
    FROM payments
    WHERE tenant_id = ${tenantId}::uuid
      AND id = ${paymentId}::uuid
      AND deleted_at IS NULL
    FOR UPDATE
  `;
  return rows[0] ?? null;
}

export async function lockVoucherRow(
  tx: Tx,
  tenantId: string,
  voucherId: string,
) {
  const rows = await tx.$queryRaw<
    Array<{
      id: string;
      status: string;
      total_debit: unknown;
      total_credit: unknown;
    }>
  >`
    SELECT id, status, total_debit, total_credit
    FROM vouchers
    WHERE tenant_id = ${tenantId}::uuid
      AND id = ${voucherId}::uuid
      AND deleted_at IS NULL
    FOR UPDATE
  `;
  return rows[0] ?? null;
}
