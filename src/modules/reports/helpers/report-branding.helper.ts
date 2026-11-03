import * as fs from "fs";
import * as path from "path";
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

const KF_FALLBACK_NAME = "King Fisher Technologies";

/** Platform KingFisher logo as data-URI for Puppeteer (avoids remote fetch failures). */
export function loadPlatformLogoDataUri(): string | null {
  const candidates = [
    path.join(process.cwd(), "public", "branding", "king-fisher-technologies-logo.png"),
    path.join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "public",
      "branding",
      "king-fisher-technologies-logo.png",
    ),
  ];
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) {
        const buf = fs.readFileSync(file);
        return `data:image/png;base64,${buf.toString("base64")}`;
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

function publicLogoUrl(): string | null {
  const base =
    process.env.PUBLIC_API_URL?.trim() ||
    process.env.RENDER_EXTERNAL_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    "";
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/branding/king-fisher-technologies-logo.png`;
}

/**
 * Tenant org identity for catalogue report packs.
 * Only logo + company identity differ from Fresa samples — form chrome stays sample colors.
 */
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
      phone: true,
      email: true,
      website: true,
      vat_number: true,
      cr_number: true,
      iata_cargo_agent_code: true,
      customs_code: true,
      country_code: true,
    },
  });

  const legalName =
    tenant?.display_name?.trim() ||
    tenant?.name?.trim() ||
    KF_FALLBACK_NAME;
  const tradeName = tenant?.name?.trim() || legalName;
  const addressLines = [tenant?.address, tenant?.city]
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);

  const platformDataUri = loadPlatformLogoDataUri();
  const logoUrl =
    tenant?.logo_url?.trim() ||
    publicLogoUrl() ||
    platformDataUri ||
    null;

  /** Prefer data-URI for Puppeteer reliability when tenant has no logo. */
  const logoDataUri =
    tenant?.logo_url?.trim()
      ? null
      : platformDataUri;

  return {
    company_name: legalName,
    legal_name: legalName,
    trade_name: tradeName,
    logo_url: logoUrl,
    logo_data_uri: logoDataUri,
    address: addressLines.length ? addressLines.join(", ") : null,
    address_lines: addressLines,
    phone: tenant?.phone ?? null,
    email: tenant?.email ?? null,
    website: tenant?.website ?? null,
    tax_id: tenant?.cr_number ?? tenant?.vat_number ?? null,
    vat_number: tenant?.vat_number ?? null,
    gstin: tenant?.vat_number ?? null,
    cr_number: tenant?.cr_number ?? null,
    iata_cargo_agent_code: tenant?.iata_cargo_agent_code ?? null,
    customs_code: tenant?.customs_code ?? null,
    country_code: tenant?.country_code ?? null,
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

/** Logo src for HTML templates: tenant URL, else embedded KF data-URI. */
export function brandingLogoSrc(branding: ReportBranding): string | null {
  return branding.logo_data_uri || branding.logo_url || null;
}
