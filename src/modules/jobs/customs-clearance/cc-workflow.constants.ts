import { CcWorkflowStatus } from "@prisma/client";
import type { WorkflowDept } from "../../../common/workflow/workflow-dept";

export const CC_WORKFLOW_ORDER: readonly CcWorkflowStatus[] = [
  "PENDING",
  "QUOTED",
  "ACCEPTED",
  "OPS_OPEN",
  "DOCS",
  "CLASSIFIED",
  "FILED",
  "QUERY",
  "ASSESSED",
  "DUTY_PAID",
  "CLEARED",
  "RELEASED",
  "INVOICE_READY",
  "CLOSED",
] as const;

export const CC_STAGE_OWNER: Record<string, WorkflowDept> = {
  PENDING: "SALES",
  QUOTED: "SALES",
  ACCEPTED: "SALES",
  OPS_OPEN: "OPS",
  DOCS: "OPS",
  CLASSIFIED: "OPS",
  FILED: "OPS",
  QUERY: "OPS",
  ASSESSED: "OPS",
  DUTY_PAID: "ACCOUNTS",
  CLEARED: "OPS",
  RELEASED: "OPS",
  INVOICE_READY: "SALES",
  CLOSED: "SALES",
};

export const CC_MILESTONES: string[] = [
  "CC_JOB_OPENED",
  "DOCS_COMPLETE",
  "HS_CLASSIFIED",
  "ENTRY_FILED",
  "DUTY_ASSESSED",
  "DUTY_PAID",
  "CUSTOMS_CLEARED",
  "CARGO_RELEASED",
  "INVOICE_ISSUED",
  "JOB_CLOSED",
];

export const CC_CREATE_MILESTONE = "CC_JOB_OPENED";

export type ChecklistSeedItem = {
  doc_code: string;
  label: string;
  required: boolean;
  sort_order: number;
};

export const CC_CHECKLIST_IMPORT: ChecklistSeedItem[] = [
  { doc_code: "COMMERCIAL_INVOICE", label: "Commercial Invoice", required: true, sort_order: 1 },
  { doc_code: "PACKING_LIST", label: "Packing List", required: true, sort_order: 2 },
  { doc_code: "BL_AWB", label: "Bill of Lading / AWB / Waybill", required: true, sort_order: 3 },
  { doc_code: "COO", label: "Certificate of Origin", required: false, sort_order: 4 },
  { doc_code: "PERMIT", label: "Permits / licenses", required: false, sort_order: 5 },
  { doc_code: "POA", label: "Power of Attorney / CHA auth", required: true, sort_order: 6 },
];

export const CC_CHECKLIST_EXPORT: ChecklistSeedItem[] = [
  { doc_code: "COMMERCIAL_INVOICE", label: "Commercial Invoice", required: true, sort_order: 1 },
  { doc_code: "PACKING_LIST", label: "Packing List", required: true, sort_order: 2 },
  { doc_code: "BOOKING", label: "Booking / shipping instruction", required: true, sort_order: 3 },
  { doc_code: "EXPORT_LICENSE", label: "Export license", required: false, sort_order: 4 },
  { doc_code: "SB_DRAFT", label: "Shipping Bill draft data", required: true, sort_order: 5 },
  { doc_code: "POA", label: "Power of Attorney / CHA auth", required: true, sort_order: 6 },
];

export const CC_CHECKLIST_TRANSIT: ChecklistSeedItem[] = [
  { doc_code: "COMMERCIAL_INVOICE", label: "Commercial Invoice", required: true, sort_order: 1 },
  { doc_code: "PACKING_LIST", label: "Packing List", required: true, sort_order: 2 },
  { doc_code: "BL_AWB", label: "Transport document", required: true, sort_order: 3 },
  { doc_code: "POA", label: "Power of Attorney / CHA auth", required: true, sort_order: 4 },
];
