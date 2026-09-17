import { PrismaService } from "../../../prisma/prisma.service";
import { ReportBranding } from "../types/report.types";

export type ReportBankDetails = {
  beneficiary_name?: string;
  bank_name?: string;
  account_no?: string;
  iban?: string;
  swift?: string;
  address?: string;
};

export async function loadReportBranding(
  prisma: PrismaService,
  tenantId: string,
): Promise<ReportBranding> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      display_name: true,
      name: true,
      logo_url: true,
      address: true,
      city: true,
      vat_number: true,
      cr_number: true,
    },
  });
  const addressParts = [tenant?.address, tenant?.city].filter(Boolean);
  return {
    company_name: tenant?.display_name || tenant?.name || "FreightSaas",
    logo_url: tenant?.logo_url ?? null,
    address: addressParts.length ? addressParts.join(", ") : null,
    address_lines: addressParts.map(String),
    vat_number: tenant?.vat_number ?? null,
    cr_number: tenant?.cr_number ?? null,
  };
}

export async function loadDefaultBank(
  prisma: PrismaService,
  tenantId: string,
): Promise<ReportBankDetails | undefined> {
  const bank = await prisma.runWithTenant(tenantId, (tx) =>
    tx.tenantBankAccount.findFirst({
      where: { tenant_id: tenantId, deleted_at: null },
      orderBy: [{ is_default: "desc" }, { created_at: "asc" }],
      select: {
        account_name: true,
        bank_name: true,
        account_number: true,
        iban: true,
        swift_code: true,
      },
    }),
  );
  if (!bank) return undefined;
  return {
    beneficiary_name: bank.account_name ?? undefined,
    bank_name: bank.bank_name ?? undefined,
    account_no: bank.account_number ?? undefined,
    iban: bank.iban ?? undefined,
    swift: bank.swift_code ?? undefined,
  };
}
