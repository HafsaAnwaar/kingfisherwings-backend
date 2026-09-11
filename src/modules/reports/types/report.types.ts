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

export type ReportDataset = {
  title: string;
  columns: Array<{ key: string; label: string }>;
  rows: ReportListRow[];
  branding: {
    company_name: string;
    logo_url: string | null;
    address: string | null;
    vat_number: string | null;
    cr_number: string | null;
  };
  generated_at: string;
};
