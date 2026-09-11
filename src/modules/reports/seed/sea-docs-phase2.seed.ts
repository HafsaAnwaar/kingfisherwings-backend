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
  required: false,
  default: null,
};

const dateTo = {
  name: "date_to",
  label: "To date",
  type: "date" as const,
  required: false,
  default: null,
};

const jobIdParam = {
  name: "job_id",
  label: "Job",
  type: "uuid" as const,
  required: false,
  default: null,
};

/** Phase-2 sea_docs pilot (~8 active). */
export const SEA_DOCS_PHASE2_SEED: ReportTemplateSeed[] = [
  {
    code: "SEA_ARRIVAL_NOTICE_LIST",
    name: "Arrival Notice SEA List",
    family: "sea_docs",
    contexts: ["list", "job"],
    formats: ["PDF", "XLSX", "CSV"],
    description: "Sea jobs with ETA in range (arrival notice follow-up list).",
    is_active: true,
    renderer_key: "sea.arrival_notice_list",
    sort_order: 210,
    parameters_schema: [dateFrom, dateTo, branchParam],
  },
  {
    code: "SEA_CARGO_MANIFEST_LIST",
    name: "Cargo Manifest List",
    family: "sea_docs",
    contexts: ["list", "job"],
    formats: ["PDF", "XLSX", "CSV"],
    description: "Sea jobs suitable for cargo manifest listing.",
    is_active: true,
    renderer_key: "sea.cargo_manifest_list",
    sort_order: 220,
    parameters_schema: [dateFrom, dateTo, branchParam],
  },
  {
    code: "SEA_STUFFING_REPORT_LIST",
    name: "Stuffing Report List",
    family: "sea_docs",
    contexts: ["list", "job"],
    formats: ["PDF", "XLSX", "CSV"],
    description: "Jobs with stuffing records in period.",
    is_active: true,
    renderer_key: "sea.stuffing_report_list",
    sort_order: 230,
    parameters_schema: [dateFrom, dateTo, branchParam],
  },
  {
    code: "SEA_SAILING_CONFIRMATION_LIST",
    name: "Sailing Confirmation List",
    family: "sea_docs",
    contexts: ["list", "job"],
    formats: ["PDF", "XLSX", "CSV"],
    description: "Sea export jobs with sailed / ETD confirmation data.",
    is_active: true,
    renderer_key: "sea.sailing_confirmation_list",
    sort_order: 240,
    parameters_schema: [dateFrom, dateTo, branchParam],
  },
  {
    code: "SEA_BOOKING_CONFIRMATION_LIST",
    name: "Booking Confirmation List",
    family: "sea_docs",
    contexts: ["list", "job"],
    formats: ["PDF", "XLSX", "CSV"],
    description: "Sea jobs in booking-confirmed / in-progress status.",
    is_active: true,
    renderer_key: "sea.booking_confirmation_list",
    sort_order: 250,
    parameters_schema: [dateFrom, dateTo, branchParam],
  },
  {
    code: "SEA_CONTAINER_LOAD_LIST",
    name: "Container Load List",
    family: "sea_docs",
    contexts: ["list", "job"],
    formats: ["PDF", "XLSX", "CSV"],
    description: "Containers linked to sea FCL jobs.",
    is_active: true,
    renderer_key: "sea.container_load_list",
    sort_order: 260,
    parameters_schema: [dateFrom, dateTo, branchParam, jobIdParam],
  },
  {
    code: "SEA_PRE_ALERT_LIST",
    name: "Pre-Alert SEA List",
    family: "sea_docs",
    contexts: ["list", "job"],
    formats: ["PDF", "XLSX", "CSV"],
    description: "Sea jobs with pre-alert scheduled or sent.",
    is_active: true,
    renderer_key: "sea.pre_alert_list",
    sort_order: 270,
    parameters_schema: [dateFrom, dateTo, branchParam],
  },
  {
    code: "SEA_HBL_DRAFT_LIST",
    name: "HBL Draft List",
    family: "sea_docs",
    contexts: ["list", "job"],
    formats: ["PDF", "XLSX", "CSV"],
    description: "Sea jobs missing finalized HBL (draft pending).",
    is_active: true,
    renderer_key: "sea.hbl_draft_list",
    sort_order: 280,
    parameters_schema: [dateFrom, dateTo, branchParam],
  },
];
