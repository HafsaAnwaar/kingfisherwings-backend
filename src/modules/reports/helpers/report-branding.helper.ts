import * as fs from "fs";
import * as path from "path";
import { PrismaService } from "../../../prisma/prisma.service";
import { StorageService } from "../../../shared/storage/storage.service";
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

function guessLogoMime(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return "image/png";
}

async function loadTenantLogoDataUri(
  storage: StorageService | undefined,
  tenantId: string,
  logoUrl: string | null | undefined,
): Promise<string | null> {
  if (!storage || !logoUrl?.trim()) return null;
  const durable =
    storage.toDurableLogoUrl(tenantId, logoUrl) ?? logoUrl.trim();
  const s3Key = storage.deriveObjectKey(durable, tenantId);
  if (!s3Key) return null;
  const fileName = s3Key.split("/").pop() || "logo.png";
  try {
    const file = await storage.readByStoredFile(tenantId, {
      file_name: fileName,
      file_url: durable,
      s3_key: s3Key,
      mime_type: guessLogoMime(fileName),
    });
    return `data:${file.mimeType};base64,${file.buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Tenant org identity for catalogue report packs.
 * Only logo + company identity differ from Fresa samples — form chrome stays sample colors.
 * Pass StorageService so tenant logos embed as data-URIs (no R2 CORS / expiry in Puppeteer).
 */
export async function loadReportBranding(
  prisma: PrismaService,
  tenantId: string,
  storage?: StorageService,
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
  const durableLogoUrl = storage
    ? storage.toDurableLogoUrl(tenantId, tenant?.logo_url) ??
      tenant?.logo_url?.trim() ??
      null
    : tenant?.logo_url?.trim() || null;

  const tenantLogoDataUri = await loadTenantLogoDataUri(
    storage,
    tenantId,
    durableLogoUrl,
  );

  const logoUrl =
    durableLogoUrl || publicLogoUrl() || platformDataUri || null;

  /** Prefer embedded bytes for Puppeteer; fall back to platform KF logo. */
  const logoDataUri = tenantLogoDataUri || (!durableLogoUrl ? platformDataUri : null);

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

/** Logo src for HTML templates: embedded data-URI first, else URL. */
export function brandingLogoSrc(branding: ReportBranding): string | null {
  return branding.logo_data_uri || branding.logo_url || null;
}
