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
  company_name: string;
  logo_url: string | null;
  address: string | null;
  address_lines?: string[];
  vat_number: string | null;
  cr_number: string | null;
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
