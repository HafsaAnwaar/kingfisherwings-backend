type ReportListColumn = { key: string; label: string };

const JOB_COLUMNS: ReportListColumn[] = [
  { key: "job_number", label: "Job #" },
  { key: "job_type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "branch", label: "Branch" },
  { key: "etd", label: "ETD" },
  { key: "eta", label: "ETA" },
  { key: "salesperson", label: "Salesperson" },
];

const DSR_COLUMNS: ReportListColumn[] = [
  { key: "job_number", label: "Job #" },
  { key: "job_type", label: "Mode" },
  { key: "status", label: "Status" },
  { key: "branch", label: "Branch" },
  { key: "etd", label: "ETD / ATD" },
  { key: "eta", label: "ETA / ATA" },
  { key: "salesperson", label: "Sales" },
];

const PENDING_COLUMNS: ReportListColumn[] = [
  { key: "job_number", label: "Job #" },
  { key: "status", label: "Current Status" },
  { key: "job_type", label: "Type" },
  { key: "branch", label: "Branch" },
  { key: "etd", label: "ETD" },
  { key: "eta", label: "ETA" },
  { key: "salesperson", label: "Owner" },
];

const STATUS_COLUMNS: ReportListColumn[] = [
  { key: "job_number", label: "Shipment / Job" },
  { key: "job_type", label: "Type" },
  { key: "status", label: "Job Status" },
  { key: "branch", label: "Branch" },
  { key: "salesperson", label: "Salesperson" },
  { key: "etd", label: "ETD" },
  { key: "eta", label: "ETA" },
];

/** Column layouts keyed by FRESA template code (or pattern family). */
const EXACT: Record<string, { title: string; columns: ReportListColumn[] }> = {
  DAILY_STATUS_REPORT_FORMAT_1_DSR_LIST_REPORT_FORMAT: {
    title: "Daily Status Report (DSR)",
    columns: DSR_COLUMNS,
  },
  DAILY_STATUS_REPORT_FORMAT_2: {
    title: "Daily Status Report Format 2",
    columns: DSR_COLUMNS,
  },
  JOB_STATUS_REPORT_LIST_REPORT_FORMAT: {
    title: "Job Status Report",
    columns: STATUS_COLUMNS,
  },
  PENDING_SHIPMENTS_FOR_DRAFT_BL_LIST_REPORT_FORMAT: {
    title: "Pending Shipments — Draft BL",
    columns: PENDING_COLUMNS,
  },
  PENDING_SHIPMENTS_FOR_CARGO_ARRIVAL_NOTICE_LIST_REPORT_FORMAT: {
    title: "Pending Shipments — Arrival Notice",
    columns: PENDING_COLUMNS,
  },
  PENDING_SHIPMENTS_FOR_DELIVERY_ORDER_LIST_REPORT_FORMAT: {
    title: "Pending Shipments — Delivery Order",
    columns: PENDING_COLUMNS,
  },
  PENDING_SHIPMENT_FOR_CARGO_DELIVERY_DO_ISSUED_LIST_REPORT_FORMAT: {
    title: "Pending Delivery (DO Issued)",
    columns: PENDING_COLUMNS,
  },
  CLOSED_JOB_LIST_REPORT_FORMAT: {
    title: "Closed Jobs",
    columns: STATUS_COLUMNS,
  },
  CANCELLED_JOB_LIST_REPORT_FORMAT: {
    title: "Cancelled Jobs",
    columns: STATUS_COLUMNS,
  },
  OPEN_JOBS_BY_BRANCH_LIST_REPORT_FORMAT: {
    title: "Open Jobs by Branch",
    columns: JOB_COLUMNS,
  },
  SHIPMENT_STATUS_REPORT_LIST_REPORT_FORMAT: {
    title: "Shipment Status Report",
    columns: STATUS_COLUMNS,
  },
  OPS_LIST_GENERIC: {
    title: "Operations List",
    columns: JOB_COLUMNS,
  },
};

type Rule = {
  pattern: RegExp;
  title: string;
  columns: ReportListColumn[];
};

const RULES: Rule[] = [
  { pattern: /^DSR_|DAILY_STATUS_/i, title: "Daily Status Report", columns: DSR_COLUMNS },
  { pattern: /^PENDING_/i, title: "Pending Operations List", columns: PENDING_COLUMNS },
  { pattern: /JOB_STATUS|SHIPMENT_STATUS|STATUS_REPORT/i, title: "Status Report", columns: STATUS_COLUMNS },
  { pattern: /CLOSED_JOB|CANCELLED_JOB|OPEN_JOBS/i, title: "Jobs List", columns: STATUS_COLUMNS },
  { pattern: /_LIST_|LIST_REPORT/i, title: "Operations List", columns: JOB_COLUMNS },
];

export function resolveOpsListColumnConfig(
  templateCode?: string | null,
  fallbackTitle?: string,
): { title: string; columns: ReportListColumn[] } {
  const code = String(templateCode ?? "").trim();
  if (code && EXACT[code]) return EXACT[code];
  for (const rule of RULES) {
    if (code && rule.pattern.test(code)) {
      return { title: rule.title, columns: rule.columns };
    }
  }
  return {
    title: fallbackTitle || "Operations List",
    columns: JOB_COLUMNS,
  };
}
