import { ReportParamDef } from "../types/report.types";

export type ReportTemplateSeed = {
  code: string;
  name: string;
  family: string;
  contexts: string[];
  formats: string[];
  description?: string;
  is_active: boolean;
  renderer_key: string;
  sort_order: number;
  parameters_schema: ReportParamDef[];
};

const branchParam = {
  name: "branch_id",
  label: "Branch",
  type: "select" as const,
  required: false,
  default: null,
  options_source: "branches" as const,
};

const dateFrom = {
  name: "date_from",
  label: "From date",
  type: "date" as const,
  required: true,
  default: null,
};

const dateTo = {
  name: "date_to",
  label: "To date",
  type: "date" as const,
  required: true,
  default: null,
};

const dateFromOpt = { ...dateFrom, required: false };
const dateToOpt = { ...dateTo, required: false };

/** Phase-1 ops_list catalog (~10 active templates). */
export const OPS_LIST_PHASE1_SEED: ReportTemplateSeed[] = [
  {
    code: "JOBS_LIST",
    name: "Jobs List",
    family: "ops_list",
    contexts: ["list"],
    formats: ["PDF", "XLSX", "CSV"],
    description:
      "Paginated jobs list filtered by date range, branch, status, and job type.",
    is_active: true,
    renderer_key: "ops.jobs_list",
    sort_order: 10,
    parameters_schema: [
      dateFrom,
      dateTo,
      branchParam,
      {
        name: "status",
        label: "Status",
        type: "string",
        required: false,
        default: null,
      },
      {
        name: "job_type",
        label: "Job type",
        type: "string",
        required: false,
        default: null,
      },
    ],
  },
  {
    code: "ETA_FOLLOWUP",
    name: "ETA Follow-up",
    family: "ops_list",
    contexts: ["list", "job"],
    formats: ["PDF", "XLSX", "CSV"],
    description: "Open jobs with ETA in the selected window.",
    is_active: true,
    renderer_key: "ops.eta_followup",
    sort_order: 20,
    parameters_schema: [dateFrom, dateTo, branchParam],
  },
  {
    code: "ETD_FOLLOWUP",
    name: "ETD Follow-up",
    family: "ops_list",
    contexts: ["list", "job"],
    formats: ["PDF", "XLSX", "CSV"],
    description: "Open jobs with ETD in the selected window.",
    is_active: true,
    renderer_key: "ops.etd_followup",
    sort_order: 30,
    parameters_schema: [dateFrom, dateTo, branchParam],
  },
  {
    code: "MANIFEST_STATUS",
    name: "Manifest Status",
    family: "ops_list",
    contexts: ["list"],
    formats: ["PDF", "XLSX", "CSV"],
    description: "EDI / manifest submission status for Bayan and CGM filings.",
    is_active: true,
    renderer_key: "ops.manifest_status",
    sort_order: 40,
    parameters_schema: [dateFromOpt, dateToOpt],
  },
  {
    code: "PENDING_DRAFT_BL",
    name: "Pending Draft BL",
    family: "ops_list",
    contexts: ["list", "job"],
    formats: ["PDF", "XLSX", "CSV"],
    description: "Sea jobs missing a finalized HBL / draft BL document.",
    is_active: true,
    renderer_key: "ops.pending_draft_bl",
    sort_order: 50,
    parameters_schema: [dateFromOpt, dateToOpt, branchParam],
  },
  {
    code: "PENDING_DOCS",
    name: "Pending Documents",
    family: "ops_list",
    contexts: ["list", "job"],
    formats: ["PDF", "XLSX", "CSV"],
    description: "Jobs currently in DOCS_PENDING status.",
    is_active: true,
    renderer_key: "ops.pending_docs",
    sort_order: 60,
    parameters_schema: [branchParam],
  },
  {
    code: "CUSTOMS_CLEARANCE_LIST",
    name: "Customs Clearance List",
    family: "ops_list",
    contexts: ["list", "job"],
    formats: ["PDF", "XLSX", "CSV"],
    description: "Jobs in CUSTOMS_CLEARANCE status.",
    is_active: true,
    renderer_key: "ops.customs_clearance_list",
    sort_order: 70,
    parameters_schema: [branchParam],
  },
  {
    code: "OPEN_JOBS_BY_BRANCH",
    name: "Open Jobs by Branch",
    family: "ops_list",
    contexts: ["list"],
    formats: ["PDF", "XLSX", "CSV"],
    description: "Non-terminal jobs grouped/listed by branch.",
    is_active: true,
    renderer_key: "ops.open_jobs_by_branch",
    sort_order: 80,
    parameters_schema: [branchParam],
  },
  {
    code: "SALESPERSON_JOBS_LIST",
    name: "Salesperson Jobs List",
    family: "ops_list",
    contexts: ["list"],
    formats: ["PDF", "XLSX", "CSV"],
    description: "Jobs filtered by salesperson.",
    is_active: true,
    renderer_key: "ops.salesperson_jobs_list",
    sort_order: 90,
    parameters_schema: [
      dateFromOpt,
      dateToOpt,
      {
        name: "salesperson_id",
        label: "Salesperson",
        type: "select",
        required: false,
        default: null,
        options_source: "salespeople",
      },
      branchParam,
    ],
  },
  {
    code: "DELIVERED_JOBS_PERIOD",
    name: "Delivered Jobs (Period)",
    family: "ops_list",
    contexts: ["list", "job"],
    formats: ["PDF", "XLSX", "CSV"],
    description: "Jobs delivered or completed within the selected period.",
    is_active: true,
    renderer_key: "ops.delivered_jobs_period",
    sort_order: 100,
    parameters_schema: [dateFrom, dateTo, branchParam],
  },
];
