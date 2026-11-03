export type ReportParamDef = {
  name: string;
  label: string;
  type: "string" | "number" | "date" | "boolean" | "uuid" | "select";
  required: boolean;
  default: unknown;
  options?: Array<{ value: string; label: string }>;
  options_source?: "branches" | "salespeople";
};

export type ReportListRow = Record<string, string | number | null | undefined>;

export type ReportBranding = {
  /** Display / legal name shown on documents */
  company_name: string;
  legal_name: string;
  trade_name: string;
  logo_url: string | null;
  /** Puppeteer-safe embedded logo when remote URL unavailable */
  logo_data_uri?: string | null;
  address: string | null;
  address_lines?: string[];
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  tax_id?: string | null;
  vat_number: string | null;
  gstin?: string | null;
  cr_number: string | null;
  iata_cargo_agent_code?: string | null;
  customs_code?: string | null;
  country_code?: string | null;
};

export type ReportListDataset = {
  kind?: "list";
  title: string;
  columns: Array<{ key: string; label: string }>;
  rows: ReportListRow[];
  branding: ReportBranding;
  generated_at: string;
};

export type ReportDocumentDataset = {
  kind: "document";
  title: string;
  /** Handlebars template id registered in ReportRendererService */
  template_key: string;
  payload: Record<string, unknown>;
  branding: ReportBranding;
  generated_at: string;
};

export type ReportDataset = ReportListDataset | ReportDocumentDataset;

/** @deprecated use ReportListDataset — kept for gradual migration */
export type LegacyReportDataset = ReportListDataset;
