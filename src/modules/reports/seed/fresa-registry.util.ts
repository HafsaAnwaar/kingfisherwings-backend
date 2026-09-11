import {
  ReportContext,
  ReportFamily,
  ReportFormat,
} from "@prisma/client";
import { ReportParamDef } from "../types/report.types";

export type RegistryEntry = {
  code: string;
  name: string;
  family: ReportFamily | string;
  contexts?: Array<ReportContext | string>;
  formats?: Array<ReportFormat | string>;
  description?: string | null;
  parameters_schema?: ReportParamDef[] | unknown;
  sort_order?: number;
};

const FAMILY_COUNTS: Array<{ family: ReportFamily; count: number; prefix: string }> = [
  { family: "ops_list", count: 110, prefix: "OPS" },
  { family: "sea_docs", count: 134, prefix: "SEA" },
  { family: "air_docs", count: 75, prefix: "AIR" },
  { family: "quotation", count: 18, prefix: "QUO" },
  { family: "commercial", count: 99, prefix: "COM" },
  { family: "finance", count: 91, prefix: "FIN" },
  { family: "wms", count: 58, prefix: "WMS" },
  { family: "other", count: 22, prefix: "OTH" },
];

const DEFAULT_CONTEXTS: Record<string, ReportContext[]> = {
  ops_list: ["list"],
  sea_docs: ["job", "list"],
  air_docs: ["job", "list"],
  quotation: ["quotation"],
  commercial: ["invoice"],
  finance: ["gl", "list"],
  wms: ["wms", "list"],
  other: ["list"],
};

/**
 * Generates ~607 FRESA-style inactive stubs when fresaReportRegistry.json is absent.
 * Replace/augment via JSON file or POST /reports/templates/import for real FE codes.
 */
export function buildGeneratedFresaRegistry(): RegistryEntry[] {
  const rows: RegistryEntry[] = [];
  for (const pack of FAMILY_COUNTS) {
    for (let i = 1; i <= pack.count; i++) {
      const num = String(i).padStart(3, "0");
      const code = `${pack.prefix}_${num}`;
      rows.push({
        code,
        name: `${pack.family} sample ${num}`,
        family: pack.family,
        contexts: DEFAULT_CONTEXTS[pack.family] ?? ["list"],
        formats: ["PDF", "XLSX"],
        description: `FRESA registry stub (${pack.family}). Activate after renderer_key is implemented.`,
        parameters_schema: [],
        sort_order: i * 10,
      });
    }
  }
  return rows;
}

export function normalizeFamily(raw: unknown): ReportFamily {
  const v = String(raw ?? "other").toLowerCase();
  const allowed: ReportFamily[] = [
    "ops_list",
    "sea_docs",
    "air_docs",
    "commercial",
    "finance",
    "wms",
    "quotation",
    "other",
  ];
  return (allowed.includes(v as ReportFamily) ? v : "other") as ReportFamily;
}

export function normalizeContexts(raw: unknown): ReportContext[] {
  const allowed: ReportContext[] = [
    "job",
    "quotation",
    "invoice",
    "gl",
    "wms",
    "list",
    "party",
  ];
  const arr = Array.isArray(raw) ? raw : ["list"];
  const out = arr
    .map((c) => String(c).toLowerCase())
    .filter((c): c is ReportContext =>
      allowed.includes(c as ReportContext),
    );
  return out.length ? out : ["list"];
}

export function normalizeFormats(raw: unknown): ReportFormat[] {
  const arr = Array.isArray(raw) ? raw : ["PDF"];
  const out: ReportFormat[] = [];
  for (const f of arr) {
    const u = String(f).toUpperCase();
    if (u === "PDF" || u === "XLSX" || u === "CSV") {
      out.push(u as ReportFormat);
    }
  }
  return out.length ? out : ["PDF"];
}
