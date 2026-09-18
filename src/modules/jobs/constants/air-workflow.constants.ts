import type { WorkflowDept } from "../../../common/workflow/workflow-dept";

/** Shared commercial prefix for both AIR_EXPORT and AIR_IMPORT. */
export const AIR_COMMERCIAL_STAGES = [
  "QUOTE_REQUESTED",
  "CS_TRIAGED",
  "QUOTE_SENT",
  "CUSTOMER_ACCEPTED",
  "BOOKING_FORM_COMPLETE",
  "INVOICE_SENT",
] as const;

export const AIR_EXPORT_STAGE_ORDER = [
  ...AIR_COMMERCIAL_STAGES,
  "BUILD_UP",
  "DRAFT_HAWB_ISSUED",
  "PAYMENT_RECEIVED",
  "FINAL_HAWB_ISSUED",
  "MAWB_ISSUED",
  "CLOSED",
] as const;

export const AIR_IMPORT_STAGE_ORDER = [
  ...AIR_COMMERCIAL_STAGES,
  "MAWB_RECEIVED",
  "PRE_CAN_ISSUED",
  "CAN_ISSUED",
  "PAYMENT_RECEIVED",
  "DELIVERY_ORDER_ISSUED",
  "POD_RECEIVED",
  "CLOSED",
] as const;

export type AirExportStageCode = (typeof AIR_EXPORT_STAGE_ORDER)[number];
export type AirImportStageCode = (typeof AIR_IMPORT_STAGE_ORDER)[number];
export type AirWorkflowStageCode = AirExportStageCode | AirImportStageCode;

export const AIR_STAGE_OWNER: Record<AirWorkflowStageCode, WorkflowDept> = {
  QUOTE_REQUESTED: "CUSTOMER",
  CS_TRIAGED: "CS",
  QUOTE_SENT: "SALES",
  CUSTOMER_ACCEPTED: "CUSTOMER",
  BOOKING_FORM_COMPLETE: "OPS",
  INVOICE_SENT: "SALES",
  BUILD_UP: "OPS",
  DRAFT_HAWB_ISSUED: "DOCS",
  PAYMENT_RECEIVED: "ACCOUNTS",
  FINAL_HAWB_ISSUED: "DOCS",
  MAWB_ISSUED: "OPS",
  MAWB_RECEIVED: "OPS",
  PRE_CAN_ISSUED: "DOCS",
  CAN_ISSUED: "DOCS",
  DELIVERY_ORDER_ISSUED: "DOCS",
  POD_RECEIVED: "OPS",
  CLOSED: "MGMT",
};

export function airStageOrderForJobType(
  jobType: string,
): readonly string[] {
  return jobType === "AIR_IMPORT"
    ? AIR_IMPORT_STAGE_ORDER
    : AIR_EXPORT_STAGE_ORDER;
}

export function isAirExportParallel(
  current: string,
  target: string,
): boolean {
  const mawbParallel =
    (current === "BUILD_UP" ||
      current === "DRAFT_HAWB_ISSUED" ||
      current === "PAYMENT_RECEIVED" ||
      current === "FINAL_HAWB_ISSUED") &&
    target === "MAWB_ISSUED";
  const closeNeedsFinal =
    current === "FINAL_HAWB_ISSUED" && target === "CLOSED";
  return mawbParallel || closeNeedsFinal;
}
